const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    createTask,
    getTask,
    getTaskById,
    getCompletedTasks,
    updateTask,
    searchTasks,
    getAllTasks,
    deleteTask,
    getNumCompletedTasks,
} = require('../api/tasks')

router.route('/').post(createTask)
router.route('/completedTasks').get(getCompletedTasks)
router.route('/taskId/:taskId').get(getTaskById)
router.route('/:taskId').put(updateTask)
router.route('/:taskId').delete(deleteTask)
router.route('/').get(getAllTasks)
router.route('/all').get(getAllTasks)
router.route('/numCompleted').get(getNumCompletedTasks)
router.route('/search').get(searchTasks)

module.exports = router
