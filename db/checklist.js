const mongoose = require('mongoose')

const checklistItemSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    name: {
        type: String,
        default: '',
    },
    completedDate: {
        type: Date,
        default: null,
    },
    position: {
        type: Number,
        default: 0,
        required: true,
    },
})

const ChecklistItem = mongoose.model('ChecklistItem', checklistItemSchema)

module.exports = ChecklistItem
