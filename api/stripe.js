const db = require('../db')
const stripe = require('stripe')(process.env.STRIPE_KEY)

exports.createSubscriptionPortalUrl = async (req, res, next) => {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    console.log(req.body.stripeCustomerId)

    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: req.body.stripeCustomerId,
            return_url: process.env.FRONTEND,
        })
        console.log(portalSession)
        res.json({ url: portalSession.url })
    } catch (error) {
        next(error)
    }
}

exports.createCheckoutUrl = async (req, res, next) => {
    console.log(req.body)
    try {
        const session = await stripe.checkout.sessions.create({
            customer: req.body.stripeCustomerId,
            billing_address_collection: 'auto',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env[req.body.tier],
                    quantity: 1,
                },
            ],
            mode:
                req.body.tier === 'GOLD_PRICE_ID' ? 'payment' : 'subscription', //has to be subscription for recurring or one-time price, we can't mix/match
            success_url: `${process.env.FRONTEND}?subscription=success`,
            cancel_url: `${process.env.FRONTEND}?canceled=true`,
            allow_promotion_codes: true,
        })

        console.log(session)

        res.json({ url: session.url })
    } catch (error) {
        next(error)
    }
}

exports.webhook = async (req, res, next) => {
    try {
        const event = req.body
        let subscription, status, user

        // Handle the event
        switch (event.type) {
            case 'customer.subscription.updated':
                subscription = event.data.object

                customer = subscription.customer
                console.log('HANDLING SUBSCRIPTION UPDATE')
                //find user based on customer id
                user = await db.UserSettings.findOne({
                    stripeCustomerId: customer,
                })

                user.isPaid = subscription.canceled_at !== null ? false : true
                await user.save()

                break
            case 'customer.subscription.created':
                subscription = event.data.object
                status = subscription.status
                console.log(`Subscription status is ${status}.`)
                console.log(subscription)
                //grab customer id and store on user
                user = await db.UserSettings.findOne({
                    stripeCustomerId: subscription.customer,
                })

                user.isPaid = true
                await user.save()

                break
            case 'charge.succeeded':
                charge = event.data.object
                console.log(charge)
                if (charge.amount === 5000) {
                    //grab customer id and store on user
                    user = await db.UserSettings.findOne({
                        stripeCustomerId: charge.customer,
                    })

                    user.isPaid = true
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
