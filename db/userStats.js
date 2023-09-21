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
    daysLoggedIn: {
        default: [],
        type: Array,
    },
    highestStreakCount: {
        default: 1,
        type: Number,
    },
    applesCount: {
        default: 0,
        type: Number,
    },
    goldenLlamasFound: {
        default: [],
        type: Array,
    },
    didVisitLlamaLand: {
        default: false,
        type: Boolean,
    },
    llamaLandHighScore: {
        default: 0,
        type: Number,
    },
    llamaFeedings: {
        default: [],
        type: Array,
    },
})

const userStats = mongoose.model('UserStats', userStatsSchema)

module.exports = userStats
