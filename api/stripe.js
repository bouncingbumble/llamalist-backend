const YOUR_DOMAIN = process.env.FRONTEND
const db = require('../db')
const stripe = require('stripe')(process.env.STRIPE_KEY)

// setup stripe webhook

// stripe listen --forward-to localhost:8080/api/v1/stripe/webhook

exports.createCustomer = async (req, res, next) => {
    try {
        console.log('creating stripe customer')
        let user = await db.User.findById(req.body.userId)
        if (user.stripeCustomerId === '') {
            let customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
            })
            user.stripeCustomerId = customer.id

            await user.save()

            res.json(user)
        }
    } catch (err) {
        next(err)
    }
}
exports.createIntent = async (req, res, next) => {
    try {
        const setupIntent = await stripe.setupIntents.create({
            customer: req.body.id,
            payment_method_types: ['card'],
        })

        res.json({ secret: setupIntent.client_secret })
    } catch (err) {
        next(err)
    }
}

exports.createSubscription = async (req, res, next) => {
    console.log('sub endpoint hit')
    try {
        let user = await db.User.findOne({
            stripeCustomerId: req.body.stripeCustomerId,
        })

        const subscription = await stripe.subscriptions.create({
            customer: req.body.stripeCustomerId,
            items: [{ price: req.body.priceId }],
            trial_period_days:
                user.couponCode &&
                process.env.couponCode
                    .split(' ')
                    .includes(user.couponCode.toUpperCase())
                    ? 30
                    : 14,
        })

        user.stripeProductId =
            process.env.INDIVIDUAL_SUBSCRIPTION_IDs.split(' ')[0]
        await user.save()

        res.status(200).send()
    } catch (err) {
        next(err)
    }
}
exports.attachPaymentMethod = async (req, res, next) => {
    try {
        const paymentMethod = await stripe.paymentMethods.attach(req.body.pm, {
            customer: req.body.stripeCustomerId,
        })

        const customer = await stripe.customers.update(
            req.body.stripeCustomerId,
            { invoice_settings: { default_payment_method: paymentMethod.id } }
        )
        console.log(paymentMethod)
        res.status(200).send()
    } catch (err) {
        next(err)
    }
}

exports.removePaymentMethod = async (req, res, next) => {
    //https://stripe.com/docs/api/payment_methods/customer_list
    try {
        deleteCardInfo(req.body.stripeCustomerId)
        res.status(200).send()
    } catch (err) {
        next(err)
    }
}

exports.deleteCardInfo = async (stripeCustomerId) => {
    try {
        //grab payment methods for the customer
        const paymentMethods = await stripe.customers.listPaymentMethods(
            stripeCustomerId,
            { type: 'card' }
        )
        //loop trhough array of payment methods and remove them
        for await (let pm of paymentMethods.data) {
            const removedpm = await stripe.paymentMethods.detach(pm.id)
        }
        return { message: 'success' }
    } catch (err) {
        return err
    }
}

exports.createCheckoutUrl = async (req, res, next) => {
    console.log(req.body)
    try {
        const prices = await stripe.prices.list({
            lookup_keys: [req.body.lookup_key],
            expand: ['data.product'],
        })
        console.log(prices)
        const session = await stripe.checkout.sessions.create({
            customer: req.body.stripeCustomerId,
            billing_address_collection: 'auto',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: prices.data[0].id,
                    quantity: 1,
                },
            ],
            mode: 'subscription', //has to be subscription for recurring or one-time price, we can't mix/match
            success_url: `${YOUR_DOMAIN}?subscription=success`,
            cancel_url: `${YOUR_DOMAIN}?canceled=true`,
            allow_promotion_codes: true,
        })

        console.log(session)

        res.json({ url: session.url })
    } catch (error) {
        next(error)
    }
}

exports.createSubscriptionPortalUrl = async (req, res, next) => {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    console.log(req.body.stripeCustomerId)
    const returnUrl = YOUR_DOMAIN
    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: req.body.stripeCustomerId,
            return_url: returnUrl,
        })
        console.log(portalSession)
        res.json({ url: portalSession.url })
    } catch (error) {
        next(error)
    }
}

exports.webhook = async (req, res, next) => {
    try {
        const event = req.body
        // console.log(event)
        // Replace this endpoint secret with your endpoint's unique secret
        // If you are testing with the CLI, find the secret by running 'stripe listen'
        // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
        // at https://dashboard.stripe.com/webhooks
        const endpointSecret = 'whsec_7FpEPu7w4de9m0olVSHq0rYaMSVwtlN8'
        // Only verify the event if you have an endpoint secret defined.
        // Otherwise use the basic event deserialized with JSON.parse
        // if (endpointSecret) {
        //     // Get the signature sent by Stripe
        //     const signature = req.headers['stripe-signature']
        //     try {
        //         event = stripe.webhooks.constructEvent(
        //             req.body,
        //             signature,
        //             endpointSecret
        //         )
        //     } catch (err) {
        //         console.log(
        //             `⚠️  Webhook signature verification failed.`,
        //             err.message
        //         )
        //         return res.sendStatus(400)
        //     }
        // }
        let subscription
        let status
        let user

        console.log(event.type)
        // Handle the event
        switch (event.type) {
            case 'customer.subscription.trial_will_end':
                subscription = event.data.object
                status = subscription.status
                console.log(`Subscription status is ${status}.`)
                // Then define and call a method to handle the subscription trial ending.
                // handleSubscriptionTrialEnding(subscription);
                break
            case 'customer.subscription.deleted':
                subscription = event.data.object
                customer = subscription.customer
                status = subscription.status
                console.log(`Subscription status is ${status}.`)
                // Then define and call a method to handle the subscription deleted.
                // handleSubscriptionDeleted(subscriptionDeleted);
                console.log('HANDLING SUBSCRIPTION DELETION')
                //find user based on customer id
                user = await db.User.findOne({ stripeCustomerId: customer })
                console.log(user)
                //set their product to null
                user.stripeProductId = ''
                await user.save()
                console.log(user.stripeProductId)

                break
            case 'customer.subscription.created':
                subscription = event.data.object
                status = subscription.status
                console.log(`Subscription status is ${status}.`)
                //grab customer id and store on user
                user = await db.User.findOne({
                    stripeCustomerId: subscription.customer,
                })
                console.log(subscription.plan.product)
                user.stripeProductId = subscription.plan.product
                await user.save()

                // Then define and call a method to handle the subscription created.
                // handleSubscriptionCreated(subscription)
                break
            case 'customer.subscription.updated':
                subscription = event.data.object
                status = subscription.status
                console.log(`Subscription status is ${status}.`)
                console.log(subscription)
                if (subscription.plan) {
                    console.log(subscription.plan.product)
                    // Then define and call a method to handle the subscription update.
                    // handleSubscriptionUpdated(subscription);

                    user = await db.User.findOne({
                        stripeCustomerId: subscription.customer,
                    })

                    user.stripeProductId = subscription.plan.product
                    await user.save()
                }

                break
            default:
                // Unexpected event type
                console.log(`Unhandled event type ${event.type}.`)
        }
        // Return a 200 response to acknowledge receipt of the event
        res.send()
    } catch (error) {
        console.log(error)
        next(error)
    }
}
