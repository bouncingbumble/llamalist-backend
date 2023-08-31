const db = require('../db')
const mongoose = require('mongoose')

exports.completedGoal = async (req, res, next) => {
    try {
        return res.sendStatus(200)
    } catch (err) {
        return next(err)
    }
}
