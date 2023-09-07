const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    getUserStats,
    updateUserStats,
    getUserOAuthTokens,
} = require('../api/users')

router.route('/stats').get(getUserStats)
router.route('/stats').put(updateUserStats)
router.route('/oauthTokens').get(getUserOAuthTokens)

module.exports = router
