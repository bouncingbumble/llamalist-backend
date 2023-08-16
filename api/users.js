const db = require('../db')

exports.getUser = async (req, res, next) => {
    try {
        console.log(`searching for user ${req.params.id}`)
        let user = await db.User.findByIdAndUpdate(req.params.id, req.body)
        return res.status(200).json(user)
    } catch (err) {
        return next(err)
    }
}

exports.getUserStats = async (req, res, next) => {
    try {
        let stats = await db.UserStats.findOne({ user: req.params.id })
        return res.status(200).json(stats)
    } catch (err) {
        return next(err)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        delete req.body.password
        const updatedUser = await db.User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )

        return res.status(200).json(updatedUser)
    } catch (err) {
        return next(err)
    }
}
