const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    createSubscriptionPortalUrl,
    createCheckoutUrl,
    webhook,
} = require('../api/stripe')

router.route('/create-portal-session').post(createSubscriptionPortalUrl)
router.route('/create-checkout-session').post(createCheckoutUrl)
router.route('/webhook').post(webhook)

module.exports = router
