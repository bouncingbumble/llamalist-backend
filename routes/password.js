const express = require('express')
const router = express.Router({ mergeParams: true })

const {
    forgotPassword,
    resetLinkSent,
    sendResetLink,
    createNewPassword,
    saveNewPassword,
    passwordResetSuccess,
    passwordResetError,
} = require('../api/password')

router.route('/').get(forgotPassword)
router.route('/').post(saveNewPassword)
router.route('/linksent').get(resetLinkSent)
router.route('/sendlink').post(sendResetLink)
router.route('/success').get(passwordResetSuccess)
router.route('/error').get(passwordResetError)
router.route('/:id/:token').get(createNewPassword)

module.exports = router
