const { getUserByEmail } = require('../clerk/api')
const db = require('../db')
const { v4: uuidv4 } = require('uuid')

exports.incomingEmail = async (req, res, next) => {
    console.log('recieved email')

    let email = req.body.headers.return_path.toLowerCase()

    console.log(`email is ${email}`)

    let notes = req.body.html
    let name = req.body.headers.subject

    let foundUser = {}

    try {
        foundUser = await getUserByEmail(email)
        if (foundUser === null) {
            //case for weird formatted emails such as prvs=02519b2408=jordan.boudreau@officeotter.com
            let truncEmail = email.split('=')[2]
            console.log(truncEmail)
            foundUser = await getUserByEmail(truncEmail)

            if (foundUser === null) {
                let err = new Error()
                err.status = 404
                err.message = `Cannot find user from senders email address ${email}`

                throw err
            }
        }
    } catch (err) {
        console.log(err)
        console.log('Cannot find user from senders email address')
        next(err)
    }

    console.log(`trying to create email task by user ${foundUser.id}`)

    try {
        await db.Task.create({
            name,
            notes,
            user: foundUser.id,
            isInbox: true,
            key: uuidv4(),
        })

        io.emit('new task', {
            userId: foundUser.id,
        })
    } catch (err) {
        console.log(err)
    }

    res.sendStatus(200)
}
