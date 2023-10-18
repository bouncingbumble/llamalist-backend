const db = require('../db')
const { checkStreak } = require('../middleware/gamification')
const { sendText } = require('./text')

exports.getUserStats = async (req, res, next) => {
    const user = req.params.id
    try {
        let stats = await db.UserStats.findOne({ user })

        if (stats === null) {
            stats = await db.UserStats.create({ user })
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
                    'https://drive.google.com/file/d/1d7kqEjDoa8miYcTptR-Rh1vfPqFOWciw/view?usp=share_link',
                ]
            )
        }
        return res.status(200).json(updatedSettings)
    } catch (err) {
        return next(err)
    }
}
