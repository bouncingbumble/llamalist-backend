const mongoose = require('mongoose')
const db = require('./index')

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        default: '',
    },
    notes: {
        type: Array,
        default: [],
    },
    checklist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChecklistItem',
            required: true,
            default: [],
        },
    ],
    labels: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Label',
        },
    ],
    due: {
        type: Date,
        default: null,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    completedDate: {
        type: Date,
    },
    position: {
        type: Number,
        default: 0,
        required: true,
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

taskSchema.pre('deleteOne', async function () {
    const task = await db.Task.findOne(this._conditions)
    const userId = task.user
    let user = await db.User.findById(userId)

    user.tasks = user.tasks.filter(
        (taskId) => taskId.toString() !== task._id.toString()
    )
    await user.save()
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
