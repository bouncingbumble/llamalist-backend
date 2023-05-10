const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    sendHTMLResponse,
    signinMsUser,
    sendTaskCard,
    sendSuccessMessage,
    sendErrorMessage,
    signOutMsUser,
    getOOUser,
} = require('../api/microsoftTeams')

router.route('/').get(sendHTMLResponse)
router.route('/signin').get(signinMsUser)
router.route('/taskcard').get(sendTaskCard)
router.route('/success').get(sendSuccessMessage)
router.route('/error').get(sendErrorMessage)
router.route('/signout/:ooUserId').post(signOutMsUser)
router.route('/user/:msUserId').get(getOOUser)

module.exports = router
