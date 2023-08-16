const express = require('express')
const router = express.Router({ mergeParams: true })
const { updateUser, getUser, getUserStats } = require('../api/users')

router.route('').get(getUser)
router.route('').put(updateUser)
router.route('/stats').get(getUserStats)

module.exports = router
