require('dotenv').config()

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const cors = require('cors')
const port = process.env.PORT || 8080
const bodyParser = require('body-parser')
const errorHandler = require('./util/error')
const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/tasks')
const userRoutes = require('./routes/users')
const labelRoutes = require('./routes/labels')
const passwordRoutes = require('./routes/password')
const checklistRoutes = require('./routes/checklist')
const stripeRoutes = require('./routes/stripe')
const msTeamsRoutes = require('./routes/microsoftTeams')
const initializeSocket = require('./util/socket')
const {
    getDailyFunFact,
    setCustomFunFact,
    overrideCurrentFunFact,
} = require('./jobs/dailyFunFact')

const db = require('./db')
const {
    loginRequired,
    ensureCorrectUser,
    ensureAdmin,
} = require('./middleware/auth')

const { checkForGoalCompletion } = require('./middleware/gamification')

const {
    slackIntegrated,
    incomingEmail,
    incomingSMS,
} = require('./api/commChannels')

const format = require('date-fns/format')

// initialize socket
global.io = require('socket.io')(server, {
    cors: { origin: process.env.FRONTEND },
})
initializeSocket()

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

//test
app.use('/api/v1/stripe', stripeRoutes)

app.use('/passwordreset', passwordRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users/:id', loginRequired, ensureCorrectUser, userRoutes)
app.use(
    '/api/v1/users/:id/labels',
    loginRequired,
    ensureCorrectUser,
    labelRoutes
)
app.use(
    '/api/v1/users/:id/checklist',
    loginRequired,
    ensureCorrectUser,
    checklistRoutes
)
app.use(
    '/api/v1/users/:id/tasks',
    loginRequired,
    ensureCorrectUser,
    checkForGoalCompletion,
    taskRoutes
)
app.use('/api/v1/incomingEmail', incomingEmail)
app.post('/sms', incomingSMS)
app.use('/api/v1/msteams', msTeamsRoutes)
app.get('/signin/chromeext', (req, res) => {
    res.sendFile(__dirname + '/static/chrome/chromesignin.html')
})
app.get('/api/v1/users/:id/funfact', async (req, res) => {
    const funFact = await db.FunFact.findOne()
    res.status(200).json(funFact.funFact)
})

getDailyFunFact()

app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use(errorHandler)

server.listen(port, () => {
    console.log('App is running on port ' + port)
})
