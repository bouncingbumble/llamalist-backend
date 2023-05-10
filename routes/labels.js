const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    getLabel,
    getLabels,
    createLabel,
    updateLabel,
    deleteLabel,
    addLabelToTask,
    removeLabelFromTask,
} = require('../api/labels')

router.route('/').post(createLabel)
router.route('/:labelId').get(getLabel)
router.route('/').get(getLabels)
router.route('/:labelId').put(updateLabel)
router.route('/:labelId').delete(deleteLabel)
router.route('/:labelId/tasks/:taskId').put(addLabelToTask)
router.route('/:labelId/tasks/:taskId').delete(removeLabelFromTask)

module.exports = router
