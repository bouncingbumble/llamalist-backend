const { getUser } = require('../clerk/api')
const { sendEmail } = require('../email-engine/main')
const db = require('../db')

exports.throwAnApple = async (req, res, next) => {
    const userId = req.params.id
    const email = req.body.email

    const user = await getUser(userId)

    const to = {
        email,
    }

    const subject = `BOINK - ${user.first_name} threw an apple at you!`
    const context = { name: user.first_name }

    const template = 'throwAnApple'

    sendEmail(to, subject, context, template)

    try {
        await db.UserStats.findOneAndUpdate(
            { user: userId },
            { threwAnAppleAtAFriend: true }
        )
    } catch (error) {
        console.log(error)
    }

    res.sendStatus(200)
}
