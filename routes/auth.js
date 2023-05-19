const express = require('express')
const router = express.Router()
const { signup, signin, signinMicrosoft } = require('../api/auth')

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/signin/msteams', signinMicrosoft)

module.exports = router
