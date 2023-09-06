const db = require('../db')

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

    delete req.body.currentStreak

    try {
        let updatedStats = await db.UserStats.findOneAndUpdate(
            { user },
            { ...req.body },
            { new: true }
        )

        if (req.body.fedLlama) {
            updatedStats.llamaFeedings.push(new Date())
            await updatedStats.save()
        }

        return res.status(200).json(updatedStats)
    } catch (err) {
        return next(err)
    }
}
