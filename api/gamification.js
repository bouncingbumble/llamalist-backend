const db = require('../db')
const mongoose = require('mongoose')
var previousMonday = require('date-fns/previousMonday')
var addDays = require('date-fns/addDays')

exports.completedGoal = async (req, res, next) => {
    try {
        return res.sendStatus(200)
    } catch (err) {
        return next(err)
    }
}

const getUsersWhoCompleted7DayStreakLastWeek = async (req, res, next) => {
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

    console.log(winningUsers)
}

getUsersWhoCompleted7DayStreakLastWeek()
