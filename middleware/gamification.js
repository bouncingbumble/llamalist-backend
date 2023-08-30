const db = require('../db')

exports.checkForGoalCompletion = async (req, res, next) => {
    try {
        let tasks = await db.Task.find({ user: req.params.id }).populate(
            'labels checklist'
        )

        let userStats = await db.UserStats.findOne({ user: req.params.id })

        if (req.body.didVisitLlamaLand) {
            userStats.didVisitLlamaLand = true
        }

        let isFirstTimeCompleted = [false, false, false]
        let didCompleteLevel = false
        //mark the corresponding goal as completed if the isCompleted function returns true
        levels[userStats.level].forEach((goal, goalNum) => {
            if (goal.isCompleted(tasks, userStats)) {
                //if the goal was uncompleted before
                if (!userStats.areGoalsCompleted[goalNum]) {
                    //update goals with new values
                    userStats.areGoalsCompleted =
                        userStats.areGoalsCompleted.map((g, index) =>
                            index === goalNum ? true : g
                        )
                    //update first time tracker
                    isFirstTimeCompleted[goalNum] = true
                    console.log(`user completed ${goal.title}`)
                }
            }
        })

        //if all the goals are completed, the user advances to the next level
        if (userStats.areGoalsCompleted.every((v) => v === true)) {
            userStats.level = userStats.level + 1
            userStats.areGoalsCompleted = [false, false, false]
            await userStats.save()
            didCompleteLevel = true
        }

        //save the updated stats
        await userStats.save()

        //only emit if it's the first time the user has completed the goal
        if (isFirstTimeCompleted.some((v) => v === true)) {
            //emit event to frontend
            console.log('emitting goal completed')
            io.emit('goal completed', {
                userId: req.params.id,
                data: {
                    isFirstTimeCompleted,
                    didCompleteLevel,
                },
            })
        }

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
            isCompleted: (tasks) =>
                tasks.filter((t) => t.name.length > 0).length > 2
                    ? true
                    : false,
        },
        {
            title: 'Complete three tasks',
            isCompleted: (tasks) =>
                tasks.filter((t) => t.completedDate !== null).length > 2
                    ? true
                    : false,
        },
        {
            title: 'Visit llama land',
            isCompleted: (tasks, userStats) => {
                return userStats.didVisitLlamaLand
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
