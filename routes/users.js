const express = require('express')
const router = express.Router({ mergeParams: true })
const { getUserStats } = require('../api/users')

router.route('/stats').get(getUserStats)

module.exports = router
