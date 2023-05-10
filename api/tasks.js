const db = require('../db')
const mongoose = require('mongoose')

exports.createTask = async (req, res, next) => {
    let userId = req.params.id
    let foundUser = {}
    let msLabelIds = null

    try {
        foundUser = await db.User.findById(userId)

        if (req.body.requestedBy === 'MS-Teams-Ext' && req.body.labels) {
            msLabelIds = await createLabels(req.body.labels, userId)
        }

        let labelIds = await createLabels(req.body.labels, userId)

        if (msLabelIds) {
            msLabelIds.forEach((labelId) => {
                labelIds.push(labelId)
            })
        }

        if (req.body.labels && req.body.requestedBy !== 'MS-Teams-Ext') {
            req.body.labels.forEach((label) => {
                labelIds.push(label._id)
            })
        }

        let task = await db.Task.create({
            ...req.body,
            user: userId,
            labels: labelIds,
            isCompleted: false,
        })

        if (req.body.requestedBy === 'MS-Teams-Ext' && labelIds.length > 0) {
            io.emit('newLabels', userId)
        }

        task = await db.Task.findById(task._id)
            .populate({ path: 'labels' })
            .populate({ path: 'checklist' })

        foundUser.tasks.push(task._id)

        if (req.body.requestedBy === 'chrome-ext') {
            foundUser.isChromeExtIntegrated = true

            io.emit('newTask', userId)
            io.emit('newTasksMicrosoft', userId)
        } else if (req.body.requestedBy === 'MS-Teams-Ext') {
            foundUser.isMicrosoftIntegrated = true

            io.emit('newTask', userId)
            io.emit('newTasksMicrosoft', userId)
        } else if (req.body.requestedBy === 'MS-Teams-Tab') {
            foundUser.isMicrosoftIntegrated = true

            io.emit('newTask', userId)
        } else if (req.body.requestedBy === 'MS-Outlook-Tab') {
            foundUser.isMicrosoftIntegrated = true

            io.emit('newTask', userId)
        } else if (req.body.requestedBy === 'MS-Office-Tab') {
            foundUser.isMicrosoftIntegrated = true

            io.emit('newTask', userId)
        } else {
            io.emit('newTasksMicrosoft', userId)
        }
        await foundUser.save()

        return res.status(200).json(task)
    } catch (err) {
        console.log(err)
        return next(err)
    }
}

exports.getTask = async (req, res, next) => {
    try {
        let userWithTasks = await db.User.findById(req.params.id).populate({
            path: 'tasks',
            match: {
                isCompleted: false,
            },
            populate: {
                path: 'labels checklist',
            },
        })
        const tasks = userWithTasks.tasks
        return res.status(200).json(tasks.reverse())
    } catch (err) {
        return next(err)
    }
}

exports.getTaskById = async (req, res, next) => {
    try {
        const task = await db.Task.findById(req.params.taskId).populate({
            path: 'labels checklist',
        })

        res.status(200).json(task)
    } catch (err) {
        return next(err)
    }
}

exports.getAllTasks = async (req, res, next) => {
    try {
        const user = await db.User.findById(req.params.id).populate({
            path: 'tasks',
            populate: {
                path: 'labels checklist',
            },
        })
        const tasks = user.tasks

        return res.status(200).json(tasks)
    } catch (err) {
        return next(err)
    }
}

exports.getCompletedTasks = async (req, res, next) => {
    const page = req.query.page
    const userId = req.params.id

    try {
        let tasks = await db.Task.find({
            user: userId,
            isCompleted: true,
        })
            .sort({ completionDate: 'desc' })
            .skip((page - 1) * 25)
            .limit(25)
            .populate('labels checklist')

        return res.status(200).json(tasks)
    } catch (err) {
        console.log(err)
    }
}

exports.getNumCompletedTasks = async (req, res, next) => {
    try {
        const userWithTasks = await db.User.findById(req.params.id).populate({
            path: 'tasks',
            match: {
                isCompleted: true,
            },
        })

        return res.status(200).json(userWithTasks.tasks.length)
    } catch (err) {
        return next(err)
    }
}

exports.updateTask = async (req, res, next) => {
    let userId = req.params.id
    let user = await db.User.findById(userId)

    try {
        console.log(`searching for task ${req.params.taskId}`)

        let task = await db.Task.findById(req.params.taskId)

        if (req.body.isCompleted === true) {
            const user = await db.User.findById(req.params.id).populate('tasks')

            const numOfCompletedTasks = user.tasks.filter(
                (t) => t.isCompleted
            ).length
        }

        if (req.body.due) {
            task.due = req.body.due
        }

        task = await db.Task.findByIdAndUpdate(
            req.params.taskId,
            req.body
        ).populate('labels checklist')

        console.log(`found task and updated it`)

        if (req.headers.referer === `${process.env.FRONTEND}/`) {
            io.emit('newTasksMicrosoft', userId)
        } else {
            io.emit('newTask', userId)
        }
        return res.status(200).json(task)
    } catch (err) {
        return next(err)
    }
}

exports.searchTasks = async (req, res, next) => {
    try {
        let results = await db.Task.aggregate([
            {
                $search: {
                    index: 'default',
                    compound: {
                        must: [
                            {
                                autocomplete: {
                                    query: req.query.q,
                                    path: 'description',
                                },
                            },

                            {
                                equals: {
                                    path: 'user',
                                    value: mongoose.Types.ObjectId(
                                        req.params.id
                                    ),
                                },
                            },
                        ],
                    },
                },
            },
            {
                $limit: 10,
            },
        ])

        let resultsIds = results.map((t) => t._id.toString())

        let results2 = await db.Task.aggregate([
            {
                $search: {
                    index: 'default',
                    compound: {
                        must: [
                            {
                                text: {
                                    query: req.query.q,
                                    path: {
                                        wildcard: '*',
                                    },
                                },
                            },
                            {
                                equals: {
                                    path: 'user',
                                    value: mongoose.Types.ObjectId(
                                        req.params.id
                                    ),
                                },
                            },
                        ],
                    },
                },
            },
            {
                $limit: 10,
            },
        ])

        console.log(resultsIds)

        results2 = results2.filter(
            (r) => !resultsIds.includes(r._id.toString())
        )

        console.log(results2)

        results = await Promise.all(
            [...results, ...results2].map(async (r) => {
                const task = await db.Task.findById(r._id).populate(
                    'files labels checklist'
                )
                return task
            })
        )
        return res.status(200).json(results)
    } catch (err) {
        return next(err)
    }
}

exports.deleteTask = async (req, res, next) => {
    console.log('deleting task')
    try {
        const task = await db.Task.deleteOne({ _id: req.params.taskId })

        if (req.headers.referer === `${process.env.FRONTEND}/`) {
            io.emit('newTasksMicrosoft', req.params.id)
        } else {
            io.emit('newTask', req.params.id)
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}
