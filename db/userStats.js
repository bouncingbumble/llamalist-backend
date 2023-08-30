const mongoose = require('mongoose')

const userStatsSchema = new mongoose.Schema({
    user: {
        type: String,
        default: '',
        required: true,
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
    didVisitLlamaLand: {
        default: false,
        type: Boolean,
    },
})

const userStats = mongoose.model('UserStats', userStatsSchema)

module.exports = userStats
