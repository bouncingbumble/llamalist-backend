const express = require('express')
const router = express.Router({ mergeParams: true })
const { getCompletedTasks } = require('../api/tasks')

router.route('/').get(getCompletedTasks)

module.exports = router
