const db = require('../db')
const { checkStreak } = require('../middleware/gamification')
const { sendText } = require('./text')
const stripe = require('stripe')(process.env.STRIPE_KEY)
const { v4: uuidv4 } = require('uuid')

exports.getUserStats = async (req, res, next) => {
    const user = req.params.id
    try {
        let stats = await db.UserStats.findOne({ user })

        if (stats === null) {
            stats = await db.UserStats.create({ user })
            await createFirstTasks(user)
        }

        return res.status(200).json(stats)
    } catch (err) {
        return next(err)
    }
}

exports.updateUserStats = async (req, res, next) => {
    const user = req.params.id

    //weird behavior with saving array of streak dates so we remove,

    delete req.body.daysLoggedIn

    try {
        let updatedStats = await db.UserStats.findOneAndUpdate(
            { user },
            { ...req.body },
            { new: true }
        )

        if (req.body.fedLlama) {
            updatedStats.llamaFeedings.push(new Date())
            await updatedStats.save()

            let feedings = 0
            updatedStats.llamaFeedings.map((feeding) => {
                if (
                    Math.abs(new Date() - new Date(feeding)) / 36e5 <
                    new Date().getHours()
                ) {
                    feedings = feedings + 1
                }
            })
            if (feedings === 3) {
                checkStreak(updatedStats)
            }
        }

        return res.status(200).json(updatedStats)
    } catch (err) {
        return next(err)
    }
}
exports.getUserSettings = async (req, res, next) => {
    const user = req.params.id
    try {
        let settings = await db.UserSettings.findOne({ user })

        if (settings === null) {
            settings = await db.UserSettings.create({ user })
        }

        return res.status(200).json(settings)
    } catch (err) {
        return next(err)
    }
}

exports.updateUserSettings = async (req, res, next) => {
    const user = req.params.id

    try {
        let updatedSettings = await db.UserSettings.findOneAndUpdate(
            { user },
            { ...req.body },
            { new: true }
        )

        if (req.body.sendWelcomeText) {
            sendText(
                updatedSettings.phoneNumber,
                'Welcome to Llama List, send me a text to add to your list from anywhere!',
                [
                    'https://office-otter-production.s3.us-east-2.amazonaws.com/ca2a31cd-1999-4fc6-a0ab-486d2c297f74Llama%20List.vcf',
                ]
            )
        }

        if (req.body.createStripeCustomer) {
            try {
                let customer = await stripe.customers.create({
                    email: req.body.email,
                    name: req.body.email,
                })
                updatedSettings.stripeCustomerId = customer.id

                await updatedSettings.save()
            } catch (err) {
                console.log(err)
            }
        }

        return res.status(200).json(updatedSettings)
    } catch (err) {
        return next(err)
    }
}

const createFirstTasks = async (id) => {
    try {
        //grab llama list label
        const label = await db.Label.findOne({ name: '🦙 llama list' })
        let task = await db.Task.create({
            user: id,
            isNewTask: false,
            name: 'See your stats on the top right? Click an element for the detailed view.',
            due: null,
            when: new Date(),
            completedDate: null,
            position: 0,
            key: uuidv4(),
            isInbox: false,
            labels: [label._id],
            checklist: [],
        })
        //create checklist items
        const items = [
            {
                name: '⭐️⭐️⭐️ => levels and goals',
                position: 1000,
                task: task._id,
            },
            {
                name: '🍎 => spend your apples in the apple emporium',
                position: 1010,
                task: task._id,
            },
            {
                name: '🔥 => earn more apples by keeping a daily streak',
                position: 1020,
                task: task._id,
            },
            {
                name: '🦙 => find the hidden golden llama each week for 50 apples!!',
                position: 1030,
                task: task._id,
            },
            {
                name: '🅰🅱 => user profile',
                position: 1040,
                task: task._id,
            },
        ]

        const createdChecklistItems = await Promise.all(
            items.map(async (item) => {
                let createdItem = await db.ChecklistItem.create(item)
                return createdItem._id
            })
        )

        task.checklist = createdChecklistItems
        await task.save()

        await db.Task.create({
            user: id,
            isNewTask: false,
            name: 'Check me off to earn your first apple',
            due: null,
            when: new Date(),
            completedDate: null,
            position: 0,
            key: uuidv4(),
            isInbox: false,
            labels: [label._id],
            checklist: [],
        })
    } catch (error) {
        console.log(error)
    }
    return
}
