const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    completedGoal,
    getUsersWhoCompleted7DayStreakLastWeek,
} = require('../api/gamification')

router.route('').post(completedGoal)
router.route('/7dayStreak').get(getUsersWhoCompleted7DayStreakLastWeek)

module.exports = router
