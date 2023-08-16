const db = require('../db')

exports.checkForGoalCompletion = async (req, res, next) => {
    console.log('running')
    try {
        const user = await db.User.findById(req.params.id).populate({
            path: 'tasks',
            populate: {
                path: 'labels checklist',
            },
        })

        const userLevel = 0

        console.log(user)

        levels[userLevel].forEach((l) => {
            console.log(user.tasks.length)
            if (l.isCompleted(user)) {
                console.log('completed!' + l.title)
                //mark appropriate shit on users data schema
                //emit event to frontend
                io.emit('goal completed', {
                    userId: req.params.id,
                    level: userLevel,
                    goal: l.title,
                })
            }
        })

        return next()
    } catch (error) {
        console.log(error)
        return next()
    }
}

const levels = [
    [
        {
            title: 'Add three tasks',
            isCompleted: (user) => (user.tasks.length > 2 ? true : false),
        },
        {
            title: 'Complete three tasks',
            isCompleted: () => {
                return false
            },
        },
        {
            title: 'Visit llama land',
            isCompleted: () => {
                return false
            },
        },
    ],
    [
        {
            title: 'Lorem ipsum dolor sit amet',
            isCompleted: () => {
                return false
            },
        },
        {
            title: 'Lorem ipsum dolor sit amet consectetur adipisicing.',
            isCompleted: () => {
                return false
            },
        },
        {
            title: 'Lorem ipsum dolor sit amet consectetur.',
            isCompleted: () => {
                return false
            },
        },
    ],
    [
        {
            title: 'Lorem ipsum dolor sit amet',
            isCompleted: () => {
                return false
            },
        },
        {
            title: 'Lorem ipsum dolor sit amet consectetur adipisicing.',
            isCompleted: () => {
                return false
            },
        },
        {
            title: 'Lorem ipsum dolor sit amet consectetur.',
            isCompleted: () => {
                return false
            },
        },
    ],
]
