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
const { getUserByPhoneNumber } = require('./clerk/api')
const { incomingText } = require('./api/text')
const { webhook } = require('./api/stripe')

global.io = require('socket.io')(server, {
    cors: { origin: [process.env.FRONTEND, process.env.NETLIFY_FRONTEND] },
})

initializeSocket()

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use('/api/v1/users/:id', ClerkExpressRequireAuth, userRoutes)
app.use('/api/v1/users/:id/emails', ClerkExpressRequireAuth, emailRoutes)
app.use('/api/v1/users/:id/labels', ClerkExpressRequireAuth, labelRoutes)
app.use('/api/v1/users/:id/checklist', ClerkExpressRequireAuth, checklistRoutes)
app.use('/api/v1/users/:id/tasks', ClerkExpressRequireAuth, taskRoutes)
app.use(
    '/api/v1/users/:id/completedTasks',
    ClerkExpressRequireAuth,
    completedTasksRoutes
)
app.use(
    '/api/v1/users/:id/gamification',
    ClerkExpressRequireAuth,
    gamificationRoutes
)

app.get('/api/v1/llama', async (req, res) => {
    const llama = await db.Llama.findOne()
    res.status(200).json(llama)
})

app.post('/api/v1/incomingEmail', incomingEmail)
app.post('/api/v1/incomingSMS', incomingText)

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
