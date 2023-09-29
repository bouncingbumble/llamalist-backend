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
        default: 1,
        type: Number,
    },
    highestStreakCount: {
        default: 1,
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
    llamaLandHighScore: {
        default: 0,
        type: Number,
    },
    llamaFeedings: {
        default: [],
        type: Array,
    },
    llamaLocations: {
        type: Array,
        default: [
            { component: 'Nature', type: 'Winter' },
            { component: 'Nature', type: 'Spring' },
            { component: 'Nature', type: 'Summer' },
            { component: 'Nature', type: 'Autumn' },
            { component: 'Nature', type: 'AllSeasons' },
        ],
    },
})

const userStats = mongoose.model('UserStats', userStatsSchema)

module.exports = userStats
