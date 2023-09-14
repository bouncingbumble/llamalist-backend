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
