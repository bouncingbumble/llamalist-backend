const db = require('../db')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res, next) => {
    if (req.body.email === undefined || req.body.email.length === 0) {
        let err = new Error()
        err.message = 'Email cannot be blank'
        next(err)
    }

    try {
        const foundUserSettings = await db.UserSettings.findOne({
            email: req.body.email.toLowerCase(),
        })

        if (foundUserSettings) {
            let err = new Error('An account already exists with this email')
            err.status = 401
            return next(err)
        } else {
            const newUserSettings = await db.UserSettings.create(req.body)

            const payload = createAuthenticatedPayload(newUserSettings)

            res.status(200).json(payload)
        }
    } catch (error) {
        return next(error)
    }
}

exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const foundUserSettings = await db.UserSettings.findOne({
            email: email.toLowerCase(),
        }).select('+password')

        const passwordsMatch = await foundUserSettings.comparePassword(password)

        if (!passwordsMatch) {
            const err = new Error('Wrong password')
            err.status = 400
            return next(err)
        }

        const token = createAuthenticatedPayload(foundUserSettings)

        res.status(200).json(token)
    } catch (err) {
        return next({
            status: 400,
            message: 'Cannot find user :(',
            data: err,
        })
    }
}

const createAuthenticatedPayload = (user) => {
    const { _id, email, name } = user
    //create an authenticated session
    let token = jwt.sign({ _id, email, name }, process.env.SECRET_KEY)
    return token
}
