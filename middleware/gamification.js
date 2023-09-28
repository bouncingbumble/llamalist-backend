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

exports.checkStreak = async (userStats) => {
    try {
        let date = new Date()
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

            let dayOfWeek = date.getDay()
            dayOfWeek = dayOfWeek - 1
            if (dayOfWeek === 0) {
                dayOfWeek = 6
            }

            let fibNums = [5, 10, 15, 20, 25, 30, 50]
            userStats.applesCount = userStats.applesCount + fibNums[dayOfWeek]
        }

        let currentStreak = 1
        let daysOfWeekCompleted = new Array(7).fill(false)

        let reversed = userStats.daysLoggedIn
        reversed.reverse()
        //loop through dates
        for (let i = 0; i < reversed.length - 1; i++) {
            if (
                isThisWeek(new Date(reversed[i]), {
                    weekStartsOn: 1,
                })
            ) {
                if (isMonday(new Date(reversed[i]))) {
                    daysOfWeekCompleted[0] = true
                }
                if (isTuesday(new Date(reversed[i]))) {
                    daysOfWeekCompleted[1] = true
                }
                if (isWednesday(new Date(reversed[i]))) {
                    daysOfWeekCompleted[2] = true
                }
                if (isThursday(new Date(reversed[i]))) {
                    daysOfWeekCompleted[3] = true
                }
                if (isFriday(new Date(reversed[i]))) {
                    daysOfWeekCompleted[4] = true
                }
                if (isSaturday(new Date(reversed[i]))) {
                    daysOfWeekCompleted[5] = true
                }
                if (isSunday(new Date(reversed[i]))) {
                    daysOfWeekCompleted[6] = true
                }
            }

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
        userStats.currentStreak = currentStreak
        userStats.daysOfWeekCompleted = daysOfWeekCompleted
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
