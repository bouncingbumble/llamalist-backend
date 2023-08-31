const express = require('express')
const router = express.Router({ mergeParams: true })
const { getUserStats, updateUserStats } = require('../api/users')

router.route('/stats').get(getUserStats)
router.route('/stats').put(updateUserStats)

module.exports = router
