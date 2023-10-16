const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    createTask,
    getTaskById,
    updateTask,
    getAllTasks,
    deleteTask,
    getNumCompletedTasks,
} = require('../api/tasks')

router.route('/').post(createTask)
router.route('/numCompleted').get(getNumCompletedTasks)
router.route('/taskId/:taskId').get(getTaskById)
router.route('/:taskId').put(updateTask)
router.route('/:taskId').delete(deleteTask)
router.route('/').get(getAllTasks)
router.route('/all').get(getAllTasks)

module.exports = router
