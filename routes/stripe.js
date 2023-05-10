const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    createCheckoutUrl,
    createSubscriptionPortalUrl,
    webhook,
    createCustomer,
    createIntent,
    createSubscription,
    attachPaymentMethod,
    removePaymentMethod,
} = require('../api/stripe')

router.route('/create-checkout-session').post(createCheckoutUrl)
router.route('/customer').post(createCustomer)
router.route('/intent').post(createIntent)
router.route('/subscription').post(createSubscription)
router.route('/attachPaymentMethod').post(attachPaymentMethod)
router.route('/removePaymentMethod').post(removePaymentMethod)
router.route('/create-portal-session').post(createSubscriptionPortalUrl)
router.route('/webhook').post(webhook)

module.exports = router
