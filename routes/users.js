const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    getUserStats,
    getSignInToken,
    updateUserStats,
    getUserSettings,
    updateUserSettings,
} = require('../api/users')

router.route('/stats').get(getUserStats)
router.route('/stats').put(updateUserStats)
router.route('/settings').get(getUserSettings)
router.route('/signInToken').get(getSignInToken)
router.route('/settings').put(updateUserSettings)

module.exports = router
