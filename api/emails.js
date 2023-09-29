const { getUser } = require('../clerk/api')
const { sendEmail } = require('../email-engine/main')

exports.throwAnApple = async (req, res, next) => {
    const userId = req.params.id
    const toEmail = req.body.toEmail

    console.log(userId)

    const user = await getUser(userId)

    console.log(user)

    const to = {
        email: toEmail,
    }

    const subject = `BOINK - ${user.first_name} threw an apple at you!`
    const context = {}

    const template = 'throwAnApple'

    sendEmail(to, subject, context, template)

    res.sendStatus(200)
}
