const db = require('../db')
const { v4: uuidv4 } = require('uuid')

exports.incomingText = async (req, res, next) => {
    const from = req.body.data.payload.from.phone_number
    const messageBody = req.body.data.payload.text

    const user = await db.UserSettings.findOne({ phoneNumber: from })

    try {
        await db.Task.create({
            name: messageBody,
            user: user.user,
            isInbox: true,
            key: uuidv4(),
        })

        io.emit('new task', {
            userId: user.id,
        })
    } catch (err) {
        console.log(err)
    }

    res.sendStatus(200)
}
