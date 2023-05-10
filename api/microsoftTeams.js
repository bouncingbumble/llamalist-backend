const db = require('../db')
const path = require('path')
const { getJwtToken } = require('./auth')

exports.sendHTMLResponse = async (req, res, next) => {
    const { msUserId, message, link } = req.query

    try {
        const user = await await db.User.findOne({
            microsoftId: msUserId,
        })
        if (user) {
            const token = getJwtToken(user)
            res.redirect(
                encodeURI(
                    `${process.env.BACKEND}/api/v1/msteams/taskcard/?token=${token}&ooUserId=${user._id}&message=${message}&link=${link}&name=${user.name}&email=${user.email}&msUserId=${msUserId}`
                )
            )
        } else {
            res.redirect(
                encodeURI(
                    `${process.env.BACKEND}/api/v1/msteams/signin/?msUserId=${msUserId}&message=${message}&link=${link}`
                )
            )
        }
    } catch (error) {
        next(error)
    }
}

exports.signinMsUser = async (req, res) => {
    res.sendFile(path.join(__dirname, '../static', '/ms-teams/signin.html'))
}

exports.sendTaskCard = async (req, res) => {
    res.sendFile(path.join(__dirname, '../static', '/ms-teams/taskcard.html'))
}

exports.sendSuccessMessage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../static', '/ms-teams/success.html'))
}

exports.sendErrorMessage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../static', '/ms-teams/error.html'))
}

exports.signOutMsUser = async (req, res, next) => {
    try {
        await db.User.findByIdAndUpdate(
            req.params.ooUserId,
            { microsoftId: '' },
            { new: true }
        )
        return res.status(200).send({ message: 'success' })
    } catch (error) {
        return next(error)
    }
}

exports.getOOUser = async (req, res, next) => {
    try {
        let user = await db.User.findOne({ microsoftId: req.params.msUserId })

        if (user) {
            const token = getJwtToken(user)

            user = {
                name: user.name,
                email: user.email,
                profilePhotoUrl: user.profilePhotoUrl,
                notificationSettings: user.notificationSettings,
                token: token,
                _id: user._id,
            }
        }

        return res.status(200).json(user)
    } catch (error) {
        return next(error)
    }
}
