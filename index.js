require('dotenv').config()
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
const authRoutes = require('./routes/auth')
const labelRoutes = require('./routes/labels')
const emailRoutes = require('./routes/emails')
const gamificationRoutes = require('./routes/gamification')
const checklistRoutes = require('./routes/checklist')
const stripeRoutes = require('./routes/stripe')
const initializeSocket = require('./util/socket')
const {
    setDailyFunFact,
    setCustomFunFact,
    overrideCurrentFunFact,
} = require('./jobs/dailyFunFact')
const { setGoldenLlamaLocation } = require('./jobs/goldenLlama')

const db = require('./db')
const { checkForGoalCompletion } = require('./middleware/gamification')
const { incomingEmail } = require('./api/email')
const { getTokenFromMsId } = require('./clerk/api')
const { incomingText } = require('./api/text')
const { webhook } = require('./api/stripe')
const { loginRequired, ensureCorrectUser } = require('./middleware/auth')

global.io = require('socket.io')(server, {
    cors: { origin: [process.env.FRONTEND, process.env.NETLIFY_FRONTEND] },
})

initializeSocket()

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use('/api/v1/users/:id', loginRequired, ensureCorrectUser, userRoutes)
app.use('/api/v1/auth', authRoutes)
app.use(
    '/api/v1/users/:id/emails',
    loginRequired,
    ensureCorrectUser,
    emailRoutes
)
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
app.use(
    '/api/v1/users/:id/completedTasks',
    loginRequired,
    ensureCorrectUser,
    completedTasksRoutes
)
app.use(
    '/api/v1/users/:id/gamification',
    loginRequired,
    ensureCorrectUser,
    gamificationRoutes
)

app.post('/api/v1/incomingSMS', incomingText)
app.post('/api/v1/incomingEmail', incomingEmail)
app.get('/api/v1/tokenFromMsId/:msId', getTokenFromMsId)

//need for llama on website
app.get('/api/v1/llama', async (req, res) => {
    const llama = await db.Llama.findOne()
    res.status(200).json(llama)
})

app.get('/api/v1/users/:id/llama', async (req, res) => {
    const llama = await db.Llama.findOne()
    res.status(200).json(llama)
})

app.use('/api/v1/users/:id/stripe', stripeRoutes)
app.post('/api/v1/stripe/webhook', webhook)

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
