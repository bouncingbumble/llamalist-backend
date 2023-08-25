const express = require('express')
const router = express.Router({ mergeParams: true })
const { completedGoal } = require('../api/gamification')

router.route('').post(completedGoal)

module.exports = router
