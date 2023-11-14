const db = require('../db')
const { checkForGoalCompletion } = require('../middleware/gamification')

exports.createChecklistItem = async (req, res, next) => {
    const taskId = req.params.taskId
    const checklistItem = { ...req.body, task: taskId }

    try {
        const createdChecklistItem = await db.ChecklistItem.create(
            checklistItem
        )

        let task = await db.Task.findById(taskId)
        task.checklist.push(createdChecklistItem._id)
        await task.save()

        // check middlware after task updates
        checkForGoalCompletion(req)

        if (req.headers.referer === `${process.env.FRONTEND}/`) {
            io.emit('newTasksMicrosoft', req.params.id)
        } else {
            io.emit('newTask', req.params.id)
        }

        return res.status(200).json(createdChecklistItem)
    } catch (error) {
        return next(error)
    }
}

exports.updateChecklistItem = async (req, res, next) => {
    try {
        const itemId = req.params.itemId

        try {
            const updatedItem = await db.ChecklistItem.findByIdAndUpdate(
                itemId,
                req.body,
                { new: true }
            )

            if (req.headers.referer === `${process.env.FRONTEND}/`) {
                io.emit('newTasksMicrosoft', req.params.id)
            } else {
                io.emit('newTask', req.params.id)
            }

            return res.status(200).json(updatedItem)
        } catch (error) {
            return next(error)
        }
    } catch (error) {
        return next(error)
    }
}

exports.deleteChecklistItem = async (req, res, next) => {
    const taskId = req.params.taskId
    const itemId = req.params.itemId

    try {
        const response = await db.ChecklistItem.findByIdAndDelete(itemId)

        const task = await db.Task.findById(taskId)
        task.checklist = task.checklist.filter((id) => id != itemId)
        await task.save()

        if (response === null) {
            let error = new Error()
            error.message = 'could not find checklist item to delete'
            return next(error)
        } else {
            if (req.headers.referer === `${process.env.FRONTEND}/`) {
                io.emit('newTasksMicrosoft', req.params.id)
            } else {
                io.emit('newTask', req.params.id)
            }

            return res.status(200).json({ message: 'successfully deleted' })
        }
    } catch (error) {
        return next(error)
    }
}

exports.getChecklistItem = async (req, res, next) => {
    try {
        const item = await db.ChecklistItem.findById(req.params.itemId)
        return res.status(200).json(item)
    } catch (error) {
        return next(error)
    }
}
