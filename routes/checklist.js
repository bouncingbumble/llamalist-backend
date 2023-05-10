const express = require('express')
const router = express.Router({ mergeParams: true })
const {
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    getChecklistItem,
} = require('../api/checklist')

router.route('/:taskId').post(createChecklistItem)
router.route('/:taskId/:itemId').put(updateChecklistItem)
router.route('/:taskId/:itemId').delete(deleteChecklistItem)
router.route('/:itemId').get(getChecklistItem)

module.exports = router
