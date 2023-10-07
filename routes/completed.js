const express = require('express')
const router = express.Router({ mergeParams: true })
const { getCompletedTasks, searchCompletedTasks } = require('../api/tasks')

router.route('/').get(getCompletedTasks)
router.route('/search').get(searchCompletedTasks)

module.exports = router
