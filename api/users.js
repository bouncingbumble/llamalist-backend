const db = require('../db')

exports.getUserStats = async (req, res, next) => {
    try {
        let stats = await db.UserStats.findOne({ user: req.params.id })
        return res.status(200).json(stats)
    } catch (err) {
        return next(err)
    }
}
