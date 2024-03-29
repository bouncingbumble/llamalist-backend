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
    currentStreak: {
        default: 0,
        type: Number,
    },
    highestStreakCount: {
        default: 0,
        type: Number,
    },
    daysOfWeekCompleted: {
        defualt: [false, false, false, false, false, false, false],
        type: Array,
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
    threwAnAppleAtAFriend: {
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
    llamaLocations: {
        default: [],
        type: Array,
    },
    llamaAccessories: {
        default: [],
        type: Array,
    },
    currentLlama: {
        default: '',
        type: String,
    },
})

const userStats = mongoose.model('UserStats', userStatsSchema)

module.exports = userStats
