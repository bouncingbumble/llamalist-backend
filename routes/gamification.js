const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    completedGoal,
    getLeaderBoards,
    updateHighestStreak,
} = require('../api/gamification')

router.route('').post(completedGoal)
router.route('/leaderboards').get(getLeaderBoards)
router.route('/updateHighestStreak').put(updateHighestStreak)

module.exports = router
