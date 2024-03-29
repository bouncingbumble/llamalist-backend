const db = require('../db')
const {
    isFriday,
    isMonday,
    isSaturday,
    isSunday,
    isThursday,
    isTuesday,
    isWednesday,
    isThisWeek,
    differenceInDays,
} = require('date-fns')

exports.checkForGoalCompletion = async (req) => {
    try {
        let tasks = await db.Task.find({ user: req.params.id }).populate(
            'labels checklist'
        )

        let userStats = await db.UserStats.findOne({ user: req.params.id })

        let isFirstTimeCompleted = [false, false, false]
        let didCompleteLevel = false
        //mark the corresponding goal as completed if the isCompleted function returns true
        levels[userStats.level]?.forEach((goal, goalNum) => {
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
                    userStats.applesCount = userStats.applesCount + 1
                    console.log(`user completed ${goal.title}`)
                }
            }
        })

        //if all the goals are completed, the user advances to the next level
        if (userStats.areGoalsCompleted.every((v) => v === true)) {
            userStats.level = userStats.level + 1

            userStats.applesCount = userStats.applesCount + 5
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
                    applesCount: userStats.applesCount,
                },
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const levels = [
    [
        {
            title: 'Add your first task',
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
            title: 'Play the mini game by clicking on the llama',
            isCompleted: (tasks, userStats) => {
                return userStats.didVisitLlamaLand
            },
        },
    ],
    [
        {
            title: 'Text in a task',
            isCompleted: (tasks) =>
                tasks.filter((t) => t.from === 'text').length > 0
                    ? true
                    : false,
        },
        {
            title: 'Complete ten tasks',
            isCompleted: (tasks) =>
                tasks.filter((t) => t.completedDate !== null).length > 9
                    ? true
                    : false,
        },
        {
            title: 'Buy your first accessory in the llama emporium',
            isCompleted: (tasks, userStats) =>
                userStats.llamaAccessories.length > 0,
        },
    ],
    [
        {
            title: 'Add a label to a task',
            isCompleted: (tasks, userStats) =>
                tasks.filter((t) => t.labels.length > 0).length > 2
                    ? true
                    : false,
        },
        {
            title: 'Use your notes section',
            isCompleted: (tasks, userStats) =>
                tasks.filter((t) => t.notes.length > 0).length > 0
                    ? true
                    : false,
        },
        {
            title: 'Create a checklist item',
            isCompleted: (tasks, userStats) =>
                tasks.filter((t) => t.checklist.length > 0).length > 1
                    ? true
                    : false,
        },
    ],
    [
        {
            title: () => 'Email in a task',
            isCompleted: (tasks) =>
                tasks.filter((t) => t.from === 'email').length > 0
                    ? true
                    : false,
        },
        {
            title: () => 'Score over 10,000 in the llama game',
            isCompleted: (tasks, userStats) =>
                userStats.llamaLandHighScore > 10000,
        },
        {
            title: () => 'Set a start date',
            isCompleted: (tasks, userStats) =>
                tasks.filter((t) => t.when !== null).length > 2 ? true : false,
        },
    ],
    [
        {
            title: () => 'Thow an apple at a friend',
            isCompleted: (tasks, userStats) => userStats.threwAnAppleAtAFriend,
        },
        {
            title: () => 'Use 3 labels',
            isCompleted: (tasks, userStats) =>
                tasks
                    .map((t) => t.labels.length)
                    .reduce((sum, a) => sum + a, 0) >= 5,
        },
        {
            title: () => 'Create fifteen tasks',
            isCompleted: (tasks) => tasks.length > 14,
        },
    ],
    [
        {
            title: () => 'Convert a checklist item to a task',
            isCompleted: (tasks, userStats) =>
                tasks.filter((t) => t.from === 'checklist').length > 0
                    ? true
                    : false,
        },
        {
            title: () => 'Get a three day streak',
            isCompleted: (tasks, userStats) => userStats.highestStreakCount > 2,
        },
        {
            title: () => 'Feed roger an extra apple today',
            isCompleted: (tasks, userStats) => {
                let feedings = 0
                userStats.llamaFeedings.map((feeding) => {
                    if (
                        Math.abs(new Date() - new Date(feeding)) / 36e5 <
                        new Date().getHours()
                    ) {
                        feedings = feedings + 1
                    }
                })
                return feedings > 3
            },
        },
    ],
    [
        {
            title: (name) => `Take ${name} to space`,
            isCompleted: (tasks, userStats) =>
                userStats.llamaLocations.filter((l) => l.name === 'Space')
                    .length > 0,
        },
        {
            title: () => 'Complete 25 tasks',
            isCompleted: (tasks) =>
                tasks.filter((t) => t.completedDate !== null).length > 24
                    ? true
                    : false,
        },
        {
            title: (name) => `Score over 25,000 on the llama game`,
            isCompleted: (tasks, userStats) =>
                userStats.llamaLandHighScore > 25000,
        },
    ],
    [
        {
            title: () => `Buy roger another accessory`,
            isCompleted: (tasks, userStats) =>
                userStats.llamaAccessories.length > 1,
        },
        {
            title: () => 'Get a 5 day streak',
            isCompleted: (tasks, userStats) => userStats.highestStreakCount > 4,
        },
        {
            title: (name) => `Find this week's golden llama`,
            isCompleted: (tasks, userStats) =>
                isThisWeek(
                    new Date(
                        userStats.goldenLlamasFound[
                            userStats.goldenLlamasFound.length - 1
                        ]
                    ),
                    { weekStartsOn: 1 }
                ),
        },
    ],
    [
        {
            title: (name) => `Complete 25 checklist items`,
            isCompleted: (tasks, userStats) =>
                tasks
                    .map((t) => t.checklist)
                    .flat()
                    .filter((t) => t.completedDate).length > 24
                    ? true
                    : false,
        },
        {
            title: (name) => `Find 3 golden llams all time`,
            isCompleted: (tasks, userStats) =>
                userStats.goldenLlamasFound.length > 2,
        },
        {
            title: (name) => `Complete 15 tasks before their due date`,
            isCompleted: (tasks, userStats) =>
                tasks
                    .filter((t) => t.due !== null && t.completedDate)
                    .map((t) => new Date(t.due) < new Date(t.completedDate))
                    .length > 14,
        },
    ],
    [
        {
            title: (name) => `Score over 50,000 in the llama game`,
            isCompleted: (tasks, userStats) =>
                userStats.llamaLandHighScore > 50000,
        },
        {
            title: () => 'Get a 10 day streak',
            isCompleted: (tasks, userStats) => userStats.highestStreakCount > 9,
        },
        {
            title: (name) => `Complete 50 tasks`,
            isCompleted: (tasks) =>
                tasks.filter((t) => t.completedDate !== null).length > 49
                    ? true
                    : false,
        },
    ],
]

exports.checkStreak = async (userStats) => {
    try {
        let date = new Date(new Date().setHours(0, 0, 0, 0))
        let oldLength = userStats.daysLoggedIn.length

        userStats.daysLoggedIn.push(date)

        userStats.daysLoggedIn = userStats.daysLoggedIn
            .map(function (date) {
                return date.getTime()
            })
            .filter(function (date, i, array) {
                return array.indexOf(date) === i
            })
            .map(function (time) {
                return new Date(time)
            })

        await userStats.save()

        let newLength = userStats.daysLoggedIn.length

        if (newLength > oldLength) {
            io.emit('streak incremented', {
                userId: userStats.user,
            })
        }

        let currentStreak = 1

        let reversed = userStats.daysLoggedIn
        reversed.reverse()
        //loop through dates
        for (let i = 0; i < reversed.length - 1; i++) {
            if (
                differenceInDays(
                    new Date(reversed[i]),
                    new Date(reversed[i + 1])
                ) <= 1
            ) {
                ++currentStreak
            } else {
                break
            }
        }

        let addApplesNum = 1
        switch (currentStreak) {
            case 1:
                addApplesNum = 5
                break
            case 2:
                addApplesNum = 10
                break
            case 3:
                addApplesNum = 20
                break
            case 5:
                addApplesNum = 50
                break
            case 10:
                addApplesNum = 100
                break
            case 25:
                addApplesNum = 500
                break
            case 50:
                addApplesNum = 5000
                break

            default:
                break
        }

        userStats.applesCount = userStats.applesCount + addApplesNum
        userStats.currentStreak = currentStreak

        if (currentStreak > userStats.highestStreakCount) {
            userStats.highestStreakCount = currentStreak
        }
        await userStats.save()

        io.emit('apples acquired', {
            userId: userStats.user,
            data: {
                applesCount: userStats.applesCount,
            },
        })

        return
    } catch (error) {
        console.log(error)
        return
    }
}
