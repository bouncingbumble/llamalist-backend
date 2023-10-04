const express = require('express')
const router = express.Router({ mergeParams: true })
const { throwAnApple } = require('../api/emails')

router.route('/throwAnApple').post(throwAnApple)

module.exports = router
