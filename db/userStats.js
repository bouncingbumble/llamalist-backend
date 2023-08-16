const mongoose = require('mongoose')

const userStatsSchema = new mongoose.Schema({
    user: {
        ref: 'User',
        required: true,
        type: mongoose.Schema.Types.ObjectId,
    },
    level: {
        default: 0,
        type: Number,
    },
    areGoalsCompleted: {
        default: [false, false, false],
        type: Array,
    },
    currentStreakCount: {
        default: 0,
        type: Number,
    },
    highestStreakCount: {
        default: 0,
        type: Number,
    },
    applesCount: {
        default: 0,
        type: Number,
    },
    easterEggsCount: {
        default: 0,
        type: Number,
    },
})

const userStats = mongoose.model('UserStats', userStatsSchema)

module.exports = userStats
