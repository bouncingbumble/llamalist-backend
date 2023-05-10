const express = require('express')
const router = express.Router({ mergeParams: true })
const { updateUser, getUser } = require('../api/users')

router.route('').get(getUser)
router.route('').put(updateUser)

module.exports = router
