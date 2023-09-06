const db = require('../db')
const mongoose = require('mongoose')

exports.createTask = async (req, res, next) => {
    let userId = req.params.id

    try {
        let task = await db.Task.create({
            ...req.body,
            user: userId,
        })

        return res.status(200).json(task)
    } catch (err) {
        console.log(err)
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
        let tasks = await db.Task.find({ user: req.params.id }).populate(
            'checklist labels'
        )

        tasks = tasks.filter((t) => t.completedDate === null).reverse()

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
        const tasks = await db.Task.find({ user: req.params.id }).match({
            isCompleted: true,
        })

        return res.status(200).json(tasks.length)
    } catch (err) {
        return next(err)
    }
}

exports.updateTask = async (req, res, next) => {
    try {
        let task = await db.Task.findByIdAndUpdate(
            req.params.taskId,
            { ...req.body },
            {
                new: true,
            }
        ).populate('labels checklist')

        if (req.body.completedDate) {
            let userStats = await db.UserStats.findOne({ user: req.params.id })
            userStats.applesCount = userStats.applesCount + 1
            await userStats.save()
            io.emit('apples acquired', {
                userId: req.params.id,
                data: {
                    applesCount: userStats.applesCount,
                },
            })
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
