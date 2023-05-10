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

const db = require('./db')
const {
    loginRequired,
    ensureCorrectUser,
    ensureAdmin,
} = require('./middleware/auth')

const {
    slackIntegrated,
    incomingEmail,
    incomingSMS,
} = require('./api/commChannels')

const format = require('date-fns/format')

global.io = require('socket.io')(server)
global.ioConnections = []

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

io.on('connection', async (socket) => {
    socket.on('connected', (userId) => {
        ioConnections.push({ socket: socket.id, user: userId })
    })

    socket.on('disconnect', () => {
        ioConnections = ioConnections.filter(
            (connection) => connection.socket !== socket.id
        )
    })
})

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
app.use('/api/v1/users/:id/tasks', loginRequired, ensureCorrectUser, taskRoutes)
app.use('/api/v1/incomingEmail', incomingEmail)
app.post('/sms', incomingSMS)
app.use('/api/v1/msteams', msTeamsRoutes)
app.get('/signin/chromeext', (req, res) => {
    res.sendFile(__dirname + '/static/chrome/chromesignin.html')
})

app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use(errorHandler)

server.listen(port, () => {
    console.log('App is running on port ' + port)
})

module.exports.io = io
