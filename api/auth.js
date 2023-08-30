const db = require('../db')
const jwt = require('jsonwebtoken')

const stripe = require('stripe')(process.env.STRIPE_KEY)

exports.signup = async (req, res, next) => {
    console.log(req.body)
    const email = req.body.data.email_addresses[0].email_address
    const name = req.body.data.first_name + ' ' + req.body.data.last_name
    const userId = req.body.data.id

    if (email === undefined || email.length === 0) {
        let err = new Error()
        err.message = 'Email cannot be blank'
        next(err)
    }

    try {
        const customers = await stripe.customers.list({
            limit: 1,
            email,
        })
        if (customers.data.length > 0) {
            const customerId = customers.data[0].id

            try {
                const customer = await stripe.customers.retrieve(customerId, {
                    expand: ['subscriptions.data.plan.product'],
                })
                console.log(customer)
                const subscription = customer.subscriptions.data.find(
                    (sub) => sub.status === 'active'
                )
                console.log(subscription)
                if (subscription) {
                    const productId = subscription.plan.product.id
                    console.log(
                        `The product ID for the customer's subscription is ${productId}`
                    )
                    req.body.stripeProductId = productId
                    req.body.stripeCustomerId = customerId
                } else {
                    console.log(
                        'The customer does not have an active subscription for the specified product'
                    )
                }
            } catch (error) {
                console.log(error)
            }
        }
        await createNewUser({ email, name, userId })

        res.status(200).json({ message: 'Success' })
    } catch (error) {
        return next(error)
    }
}

const createFirstLabels = async (userId) => {
    const newLabels = await Promise.all([
        db.Label.create({
            name: 'personal',
            user: userId,
            color: '#fab6b2',
        }),
        db.Label.create({
            name: 'work',
            user: userId,
            color: '#01b4c0',
        }),
        db.Label.create({
            name: '🦙 llama list',
            user: userId,
            color: '#0a58ce',
        }),
    ])
    return newLabels
}

const createNewUser = async (userInfo) => {
    await createFirstLabels(userInfo.userId)
    await db.UserStats.create({ user: userInfo.userId })
}
