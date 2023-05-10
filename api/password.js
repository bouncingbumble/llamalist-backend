const jwt = require('jwt-simple')
const db = require('../db')
const path = require('path')
const ejs = require('ejs')
// var Courier = require('@trycourier/courier') // get from the Courier UI
// const courier = Courier.CourierClient({
//     authorizationToken: process.env.COURIER,
// })

exports.forgotPassword = (req, res, next) => {
    const filePath = path.join(__dirname, '../')
    res.sendFile(filePath + '/static/passwordreset/passwordReset.html')
}

exports.resetLinkSent = (req, res, next) => {
    const filePath = path.join(__dirname, '../')
    res.sendFile(filePath + '/static/passwordreset/checkEmail.html')
}

exports.passwordResetSuccess = (req, res, next) => {
    const filePath = path.join(__dirname, '../')
    res.sendFile(filePath + '/static/passwordreset/success.html')
}

exports.passwordResetError = (req, res, next) => {
    const filePath = path.join(__dirname, '../')
    res.sendFile(filePath + '/static/passwordreset/error.html')
}

exports.sendResetLink = async (req, res, next) => {
    try {
        if (req.body.email !== undefined) {
            // find user and encode token with necessary info
            var emailAddress = req.body.email

            const user = await db.User.findOne({
                email: req.body.email.toLowerCase(),
            })

            var payload = {
                id: user._id,
                email: emailAddress.toLowerCase(),
            }

            var secret = user.password + '-' + user._id.getTimestamp()
            var token = jwt.encode(payload, secret)

            // send reset link via courier
            // const { messageId } = await courier.send({
            //     eventId: 'SJNY9H5V7Y4Q7TG8XEXW64K6PAR2',
            //     recipientId: user._id.toString(),
            //     profile: { email: user.email },
            //     data: {
            //         firstName: user.name.split(' ')[0],
            //         link: `${process.env.BACKEND}/passwordreset/${user._id}/${token}`,
            //     },
            // })
            console.log(messageId)

            // redirect to success page
            res.redirect(`${process.env.BACKEND}/passwordreset/linksent`)
        } else {
            // redirect to starting page with error
            res.redirect(
                `${process.env.BACKEND}/passwordreset?error=emailNotEntered`
            )
        }
    } catch (error) {
        // redirect to starting page with error
        res.redirect(`${process.env.BACKEND}/passwordreset?error=emailNotFound`)
    }
}

exports.createNewPassword = async (req, res, next) => {
    try {
        // find user and get payload info
        const user = await db.User.findById(req.params.id)

        var secret = user.password + '-' + user._id.getTimestamp()
        var payload = jwt.decode(req.params.token, secret)

        // send over reset password form with specific user data
        let filePath = path.join(__dirname, '../')
        filePath += '/static/passwordreset/createNewPassword.ejs'
        const ejsData = { id: payload.id, token: req.params.token }

        ejs.renderFile(filePath, ejsData, (error, html) => {
            if (error) {
                res.redirect(`${process.env.BACKEND}/passwordreset/error`)
            } else {
                res.send(html)
            }
        })
    } catch (error) {
        res.redirect(`${process.env.BACKEND}/passwordreset/error`)
    }
}

exports.saveNewPassword = async (req, res, next) => {
    try {
        // find user and update password
        const user = await db.User.findById(req.body.id)

        user.password = req.body.password
        user.save()

        res.redirect(`${process.env.BACKEND}/passwordreset/success`)
    } catch (error) {
        res.redirect(`${process.env.BACKEND}/passwordreset/error`)
    }
}
