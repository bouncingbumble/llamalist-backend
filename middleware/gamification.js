const db = require('../db')

exports.checkForGoalCompletion = async (req, res, next) => {
    try {
        const user = await db.User.findById(req.params.id).populate({
            path: 'tasks',
            populate: {
                path: 'labels checklist',
            },
        })

        const userStats = await db.UserStats.findOne({ user: req.params.id })

        let isFirstTimeCompleted = [false, false, false]
        let shouldAnimateLevel = false
        //mark the corresponding goal as completed if the isCompleted function returns true
        levels[userStats.level].forEach((goal, goalNum) => {
            if (goal.isCompleted(user)) {
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
            shouldAnimateLevel = true
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
                    shouldAnimateLevel,
                    isFirstTimeCompleted,
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
            isCompleted: (user) => (user.tasks.length > 2 ? true : false),
        },
        {
            title: 'Complete three tasks',
            isCompleted: () => {
                return true
            },
        },
        {
            title: 'Visit llama land',
            isCompleted: () => {
                return true
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
