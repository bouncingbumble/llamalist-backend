const db = require('../db')
const jwt = require('jsonwebtoken')

const stripe = require('stripe')(process.env.STRIPE_KEY)

exports.signup = async (req, res, next) => {
    if (req.body.email === undefined || req.body.email.length === 0) {
        let err = new Error()
        err.message = 'Email cannot be blank'
        next(err)
    }

    try {
        const foundUser = await db.User.findOne({
            email: req.body.email.toLowerCase(),
        })

        if (foundUser) {
            console.log(foundUser)
            let err = new Error('An account already exists with this email')
            err.status = 401
            return next(err)
        } else {
            const customers = await stripe.customers.list({
                limit: 1,
                email: req.body.email,
            })
            if (customers.data.length > 0) {
                const customerId = customers.data[0].id

                try {
                    const customer = await stripe.customers.retrieve(
                        customerId,
                        {
                            expand: ['subscriptions.data.plan.product'],
                        }
                    )
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
            const newUser = await createNewUser(req.body)

            const payload = createAuthenticatedPayload(newUser)

            res.status(200).json(payload)
        }
    } catch (error) {
        return next(error)
    }
}

exports.signin = async (req, res, next) => {
    try {
        console.log('trying to sign in without google or microsoft')
        const { email, password } = req.body
        console.log(email)
        const foundUser = await db.User.findOne({
            email: email.toLowerCase(),
        }).select('+password')
        console.log('comparing password hashes')
        const passwordsMatch = await foundUser.comparePassword(password)
        console.log('password hashes match')
        if (!passwordsMatch) {
            console.log('wrong password')
            const err = new Error('Wrong password')
            err.status = 400
            return next(err)
        }

        const payload = createAuthenticatedPayload(foundUser)

        res.status(200).json(payload)
    } catch (err) {
        console.log('couldnt find user')
        return next({
            status: 400,
            message: 'Cannot find user :(',
            data: err,
        })
    }
}

exports.getJwtToken = (user) => {
    const { _id, name, email, notificationSettings } = user
    let token = jwt.sign({ _id, email, name }, process.env.SECRET_KEY)
    return token
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
            name: '🦦 office otter',
            user: userId,
            color: '#0a58ce',
        }),
    ])
    return newLabels
}

const createNewUser = async (userInfo) => {
    console.log('creating user new user')
    const newUser = await db.User.create(userInfo)

    await createFirstLabels(newUser._id)

    return newUser
}

const createAuthenticatedPayload = (user) => {
    const { _id, email, name, notificationSettings } = user
    //create an authenticated session
    let token = jwt.sign(
        { _id, email, name, notificationSettings },
        process.env.SECRET_KEY
    )
    return { token, _id }
}
