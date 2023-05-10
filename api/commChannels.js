// var accountSid = process.env.TWILIO_SID // Your Account SID from www.twilio.com/console
// var authToken = process.env.TWILIO_TOKEN // Your Auth Token from www.twilio.com/console
// var twilio = require('twilio')
// var client = new twilio(accountSid, authToken)
// const MessagingResponse = require('twilio').twiml.MessagingResponse
const db = require('../db')

const { v4: uuid } = require('uuid')

exports.slackIntegrated = async (req, res, next) => {
    console.log(req.body)
    const email = req.body.email
    try {
        const user = await db.User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { secondaryEmail: email.toLowerCase() },
            ],
        })
        user.isSlackIntegrated = true
        user.slackUserId = req.body.slackUserId
        user.save()
    } catch (error) {
        next(error)
    }
    res.status(200).send()
}

exports.incomingEmail = async (req, res, next) => {
    console.log('recieved email')
    let email = req.body.headers.return_path.toLowerCase()
    console.log(`email is ${email}`)

    let notes = req.body.html
    let description = req.body.headers.subject

    let foundUser = {}

    try {
        foundUser = await db.User.findOne({
            $or: [{ email }, { secondaryEmail: email }],
        })
    } catch (err) {
        console.log(err)
        console.log('Cannot find user from senders email address')
        next(err)
    }

    if (foundUser === null) {
        //case for weird formatted emails such as prvs=02519b2408=jordan.boudreau@officeotter.com
        let truncEmail = email.split('=')[2]
        console.log(truncEmail)

        foundUser = await db.User.findOne({
            $or: [{ email: truncEmail }, { secondaryEmail: truncEmail }],
        })

        if (foundUser === null) {
            let err = new Error()
            err.status = 404
            err.message = `Cannot find user from senders email address ${email}`

            sendCouldntFindEmailNotification(email)
            return next(err)
        }
    }

    console.log(`trying to create task by user ${foundUser._id}`)

    try {
        let position = null
        const tasks = await db.Task.find({
            user: foundUser._id,
            isCompleted: false,
        })

        if (!Array.isArray(tasks) || !tasks.length) {
            position = 10000
        } else {
            //otherwise, find the task and give it that position-1
            tasks.sort((a, b) => a.position - b.position)
            position = tasks[0].position - 1
        }

        //handle attachments
        const fileIds = await Promise.all(
            req.body.attachments.map(async (a) => {
                const createdFile = await db.File.create({
                    name: a.file_name ? a.file_name : uuid(),
                    url: a.url,
                    user: foundUser._id,
                })

                return createdFile._id
            })
        )

        foundUser.files.push(...fileIds)

        const matches = description.substring(0, 100).match(/#[a-z]+/gi)

        let labels = []
        if (matches !== null) {
            matches.forEach((m) => {
                description = description.replace(m, '')
                labels.push(m.replace('#', '').toLowerCase())
            })
        }

        const labelIds = await createLabels(labels, foundUser._id)

        const task = await db.Task.create({
            description,
            notes,
            urgency: 1,
            requestedBy: req.body.headers.subject || 'email',
            user: foundUser._id,
            labels: labelIds,
            files: fileIds,
            fileIds,
            isIncoming: true,
        })

        io.emit('newTask', foundUser._id)
        io.emit('newTasksMicrosoft', foundUser._id)

        foundUser.tasks.push(task._id)

        foundUser.isEmailIntegrated = true
        await foundUser.save()
    } catch (err) {
        console.log(err)
    }

    res.status(200).send()
}

exports.incomingSMS = async (req, res, next) => {
    console.log(req.body)

    try {
        //task description
        console.log(req.body.Body)
        const description = req.body.Body

        //user who sent task
        console.log(req.body.From)
        const user = await db.User.findOne({
            phone: req.body.From,
        })

        let userId = user._id

        console.log(`trying to create task by user ${user._id}`)

        let position = null
        const tasks = await db.Task.find({
            user: user._id,
            isCompleted: false,
        })

        if (!Array.isArray(tasks) || !tasks.length) {
            position = 10000
        } else {
            //otherwise, find the task and give it that position-1
            tasks.sort((a, b) => a.position - b.position)
            position = tasks[0].position - 1
        }

        const labelIds = await createLabels(labels, user._id)
        const task = await db.Task.create({
            description: hashtagDescription,
            user: user._id,
            labels: labelIds,
            position,
        })

        console.log('emitting')
        console.log(user._id)
        io.emit('newTask', user._id)
        io.emit('newTasksMicrosoft', user._id)

        user.tasks.push(task._id)
        user.isTextIntegrated = true
        await user.save()

        // const twiml = new MessagingResponse()
        // twiml.message('Added! View at https://app.officeotter.com 🦦')

        res.writeHead(200, { 'Content-Type': 'text/xml' })
        res.end(twiml.toString())
    } catch (err) {
        console.log(err)
    }
}
