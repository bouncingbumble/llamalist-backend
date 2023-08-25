exports.completedGoal = async (req, res, next) => {
    try {
        return res.sendStatus(200)
    } catch (err) {
        return next(err)
    }
}
