const db = require('../db')
const { v4: uuidv4 } = require('uuid')
var telnyx = require('telnyx')(process.env.TELYNX_API_KEY)

exports.incomingText = async (req, res, next) => {
    const from = req.body.data.payload.from.phone_number
    const messageBody = req.body.data.payload.text

    const user = await db.UserSettings.findOne({ phoneNumber: from })

    if (user === null) {
        // this.sendText(
        //     from,
        //     'We were unable to find an account with that number. Make sure you have added your number correctly in your user profile.'
        // )
    } else {
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

            this.sendText(
                user.phoneNumber,
                'Task Added! Go to https://app.llamalist.com/tasks/inbox/All%20Labels to view.'
            )
        } catch (err) {
            console.log(err)
        }
    }

    res.sendStatus(200)
}

exports.sendText = async (to, text, media_urls) => {
    // telnyx.messages.create(
    //     {
    //         from: process.env.TELYNX_NUMBER, // Your Telnyx number
    //         to,
    //         text,
    //         media_urls,
    //     },
    //     function (err, response) {
    //         // asynchronously called
    //         console.log(response)
    //     }
    // )
}
