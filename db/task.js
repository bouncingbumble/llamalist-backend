const mongoose = require('mongoose')
const db = require('./index')

const taskSchema = new mongoose.Schema({
    user: {
        type: String,
        default: '',
        required: true,
    },
    isNewTask: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    checklist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChecklistItem',
            default: [],
        },
    ],
    labels: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Label',
            default: [],
        },
    ],
    due: {
        type: Date,
        default: null,
    },
    when: {
        type: Date,
        default: null,
    },
    createdDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    completedDate: {
        type: Date,
        default: null,
    },
    position: {
        type: Number,
        default: 0,
    },
})

/**
 * Pre-save hook to always keep seoncds and milliseconds at zero on dates
 */
taskSchema.pre('save', async function (next) {
    if (this.due) {
        this.due = this.due.setSeconds(0, 0)
    } else {
        return next()
    }
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
