const db = require('../db')
const mongoose = require('mongoose')
var previousMonday = require('date-fns/previousMonday')
var addDays = require('date-fns/addDays')
const clerk = require('@clerk/clerk-sdk-node')
const { getUser } = require('../clerk/api')
exports.completedGoal = async (req, res, next) => {
    try {
        return res.sendStatus(200)
    } catch (err) {
        return next(err)
    }
}

exports.getUsersWhoCompleted7DayStreakLastWeek = async (req, res, next) => {
    try {
        let userStats = await db.UserStats.find()

        const startOfLastWeek = previousMonday(previousMonday(new Date()))
        let previousWeeksDays = [
            startOfLastWeek,
            addDays(startOfLastWeek, 1),
            addDays(startOfLastWeek, 2),
            addDays(startOfLastWeek, 3),
            addDays(startOfLastWeek, 4),
            addDays(startOfLastWeek, 5),
            addDays(startOfLastWeek, 6),
        ]
        previousWeeksDays = previousWeeksDays.map(
            (d) => d.toISOString().split('T')[0]
        )

        let winningUsers = []

        userStats.map((stats) => {
            let usersStreakFormatted = []

            usersStreakFormatted = stats.daysLoggedIn.map(
                (d) => new Date(d).toISOString().split('T')[0]
            )

            let count = 0

            previousWeeksDays.map((d) => {
                if (usersStreakFormatted.includes(d)) {
                    count = count + 1
                }
            })

            if (count === 7) {
                //add user
                winningUsers.push(stats.user)
            }
        })

        let winningUsersNames = []
        for await (let userId of winningUsers) {
            let user = await getUser(userId)
            winningUsersNames.push(user.first_name + ' ' + user.last_name)
        }

        return res.status(200).json(winningUsersNames)
    } catch (e) {
        next(e)
    }
}
