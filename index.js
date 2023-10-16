require('dotenv').config()
const ClerkExpressRequireAuth =
    require('@clerk/clerk-sdk-node').ClerkExpressRequireAuth()
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const cors = require('cors')
const port = process.env.PORT || 8080
const bodyParser = require('body-parser')
const errorHandler = require('./util/error')
const taskRoutes = require('./routes/tasks')
const completedTasksRoutes = require('./routes/completed')
const userRoutes = require('./routes/users')
const labelRoutes = require('./routes/labels')
const emailRoutes = require('./routes/emails')
const gamificationRoutes = require('./routes/gamification')
const checklistRoutes = require('./routes/checklist')
const initializeSocket = require('./util/socket')
const {
    setDailyFunFact,
    setCustomFunFact,
    overrideCurrentFunFact,
} = require('./jobs/dailyFunFact')
const { setGoldenLlamaLocation } = require('./jobs/goldenLlama')

const db = require('./db')
const { checkForGoalCompletion } = require('./middleware/gamification')
const { getUserByEmail } = require('./clerk/api')

global.io = require('socket.io')(server, {
    cors: { origin: process.env.FRONTEND },
})

initializeSocket()

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use('/api/v1/users/:id', ClerkExpressRequireAuth, userRoutes)
app.use('/api/v1/users/:id/emails', ClerkExpressRequireAuth, emailRoutes)
app.use('/api/v1/users/:id/labels', ClerkExpressRequireAuth, labelRoutes)
app.use('/api/v1/users/:id/checklist', ClerkExpressRequireAuth, checklistRoutes)
app.use(
    '/api/v1/users/:id/tasks',
    ClerkExpressRequireAuth,
    checkForGoalCompletion,
    taskRoutes
)
app.use(
    '/api/v1/users/:id/completedTasks',
    ClerkExpressRequireAuth,
    completedTasksRoutes
)
app.use(
    '/api/v1/users/:id/gamification',
    ClerkExpressRequireAuth,
    checkForGoalCompletion,
    gamificationRoutes
)

app.get('/api/v1/llama', async (req, res) => {
    const llama = await db.Llama.findOne()
    res.status(200).json(llama)
})
app.post('/api/v1/incomingEmail', async (req, res) => {
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
        })
    } catch (err) {
        console.log(err)
    }

    res.sendStatus(200)
})

app.get('/api/v1/users/:id/llama', async (req, res) => {
    const llama = await db.Llama.findOne()
    res.status(200).json(llama)
})

setDailyFunFact()
setGoldenLlamaLocation()

app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use(errorHandler)

server.listen(port, () => {
    console.log('App is running on port ' + port)
})
