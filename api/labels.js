const db = require('../db')

exports.createLabel = async (req, res, next) => {
    const userId = req.params.id
    const labelToCreate = { ...req.body, user: userId }

    try {
        const labelWithSameName = await db.Label.find({
            user: userId,
            name: labelToCreate.name,
        })

        if (labelWithSameName.length > 0) {
            let error = new Error()
            error.message = 'A label already exists with this name'
            throw error
        }

        const createdLabel = await db.Label.create(labelToCreate)

        if (req.headers.referer === `${process.env.FRONTEND}/`) {
            io.emit('newLabelsMicrosoft', userId)
        } else {
            io.emit('newLabels', userId)
        }

        return res.status(201).json(createdLabel)
    } catch (error) {
        return next(error)
    }
}

exports.getLabel = async (req, res, next) => {
    const labelId = req.params.labelId

    try {
        const foundLabel = await db.Label.findById(labelId)
        return res.status(200).json(foundLabel)
    } catch (error) {
        return next(error)
    }
}

exports.getLabels = async (req, res, next) => {
    const userId = req.params.id

    try {
        let userWithTasks = await db.User.findById(userId).populate({
            path: 'tasks',
        })

        let usersLabels = await db.Label.find({ user: userId })
        usersLabels = usersLabels.map((l) => l._id)
        let tasks = userWithTasks.tasks
        let ls = tasks.map((t) => t.labels)
        ls = ls.flat()
        ls = ls.concat(usersLabels)

        var o = {}
        ls.forEach((item) => {
            item in o ? (o[item] += 1) : (o[item] = 1)
        })

        //put all ids in an array, sort by which ones appear the most
        var sorted = Object.keys(o).sort((a, b) => o[a] < o[b])

        let labels = await Promise.all(
            sorted.map(async (s) => {
                if (s.length > 0) {
                    return await db.Label.findById(s)
                }
            })
        )
        labels = labels.filter((x) => x !== undefined && x !== null)

        labels.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        )

        return res.status(200).json(labels)
    } catch (error) {
        return next(error)
    }
}

exports.updateLabel = async (req, res, next) => {
    const userId = req.params.id
    const labelId = req.params.labelId
    const updates = req.body

    try {
        if (updates.name) {
            const labelWithSameName = await db.Label.find({
                user: userId,
                name: updates.name,
            })

            if (labelWithSameName.length > 0) {
                let error = new Error()
                error.message = 'A label already exists with this name'
                throw error
            }
        }

        const updatedLabel = await db.Label.findByIdAndUpdate(
            labelId,
            updates,
            { new: true }
        )

        if (req.headers.referer === `${process.env.FRONTEND}/`) {
            io.emit('newLabelsMicrosoft', userId)
        } else {
            io.emit('newLabels', userId)
        }

        return res.status(200).json(updatedLabel)
    } catch (error) {
        return next(error)
    }
}

exports.deleteLabel = async (req, res, next) => {
    const userId = req.params.id
    const labelId = req.params.labelId

    try {
        const response = await db.Label.findByIdAndDelete(labelId)

        //find all user's tasks with same labelId
        let tasksWithSameLabel = await db.Task.find({
            user: userId,
            labels: labelId,
        })

        //remove labelId from tasks
        for await (let t of tasksWithSameLabel) {
            t.labels = t.labels.filter((l) => l != labelId)
            await t.save()
        }

        if (response === null) {
            let error = new Error()
            error.message = 'could not find document to delete'
            next(error)
        } else {
            if (req.headers.referer === `${process.env.FRONTEND}/`) {
                io.emit('newLabelsMicrosoft', userId)
            } else {
                io.emit('newLabels', userId)
            }

            return res.status(200).json({ message: 'successfully deleted' })
        }
    } catch (error) {
        return next(error)
    }
}

exports.addLabelToTask = async (req, res, next) => {
    //task id, add to task and save
    const labelId = req.params.labelId
    const taskId = req.params.taskId

    try {
        let task = await db.Task.findById(taskId)
        task.labels.push(labelId)
        task.save()
    } catch (error) {
        next(error)
    }

    return res
        .status(200)
        .json({ message: 'successfully added labelId to task' })
}
exports.addLabelToTemplate = async (req, res, next) => {
    //template id, add to template and save
    const labelId = req.params.labelId
    const templateId = req.params.templateId

    try {
        let template = await db.Template.findById(templateId)
        template.labels.push(labelId)
        template.save()
    } catch (error) {
        next(error)
    }

    return res
        .status(200)
        .json({ message: 'successfully added labelId to task' })
}
exports.removeLabelFromTask = async (req, res, next) => {
    //task id, add to task and save
    const labelId = req.params.labelId
    const taskId = req.params.taskId

    try {
        let task = await db.Task.findById(taskId)
        task.labels = task.labels.filter((l) => l.toString() !== labelId)
        task.save()
    } catch (error) {
        next(error)
    }

    return res
        .status(200)
        .json({ message: 'successfully added labelId to task' })
}

exports.swapLabel = async (req, res, next) => {
    try {
        const userId = req.params.id
        const { replace, replacer } = req.body

        //find the old label id
        const oldLabel = await db.Label.findOne({ user: userId, name: replace })
        console.log(oldLabel._id)
        //find the new label id
        const newLabel = await db.Label.findOne({
            user: userId,
            name: replacer,
        })
        //find the tasks with that labelId
        let tasks = await db.Task.find({ user: userId })
        tasks = tasks.filter((t) => t.labels.includes(oldLabel._id))
        //remove that label id
        for await (const task of tasks) {
            task.labels = task.labels.filter((l) => {
                console.log(l)
                console.log(l.toString() != oldLabel._id.toString())
                return l.toString() != oldLabel._id.toString()
            })

            task.labels.push(newLabel._id)
            //add the new label id
            await task.save()
        }

        return res
            .status(200)
            .json(`successfully replaced ${tasks.length} labels`)
    } catch (error) {
        next(error)
    }
}
