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

exports.getLeaderBoards = async (req, res, next) => {
    try {
        let userStats = await db.UserStats.find()

        //get users who completed 7 day streak last week
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

        let sevenDayStreakWinners = []
        for await (let userId of winningUsers) {
            let user = await getUser(userId)
            sevenDayStreakWinners.push(user.first_name + ' ' + user.last_name)
        }

        //get longest streaks
        userStats.sort((a, b) => b.highestStreakCount - a.highestStreakCount)
        const highestStreakCounts = userStats.slice(0, 9)

        let highestStreakCountWinners = []
        for await (let stats of highestStreakCounts) {
            let user = await getUser(stats.user)
            highestStreakCountWinners.push({
                name: user.first_name + ' ' + user.last_name,
                highestStreakCount: stats.highestStreakCount,
            })
        }

        //get llama game high score
        userStats.sort((a, b) => b.llamaLandHighScore - a.llamaLandHighScore)
        const highestLlamaLandScores = userStats.slice(0, 9)

        let highestLlamaLandScoreWinners = []
        for await (let stats of highestLlamaLandScores) {
            let user = await getUser(stats.user)
            highestLlamaLandScoreWinners.push({
                name: user.first_name + ' ' + user.last_name,
                llamaLandHighScore: stats.llamaLandHighScore,
            })
        }

        //get llamas found
        userStats.sort((a, b) => b.goldenLlamasFound - a.goldenLlamasFound)
        const mostLlamasFound = userStats.slice(0, 9)

        let mostLlamasFoundUsers = []
        for await (let stats of mostLlamasFound) {
            let user = await getUser(stats.user)
            mostLlamasFoundUsers.push({
                name: user.first_name + ' ' + user.last_name,
                goldenLlamasFound: stats.goldenLlamasFound,
            })
        }

        setTimeout(() => {
            return res.status(200).json({
                sevenDayStreakWinners,
                highestStreakCountWinners,
                highestLlamaLandScoreWinners,
                mostLlamasFoundUsers,
            })
        }, 0)
    } catch (e) {
        console.log(e)
    }
}

exports.updateHighestStreak = async (req, res, next) => {
    const user = req.params.id

    //weird behavior with saving array of streak dates so we remove,

    delete req.body.daysLoggedIn

    try {
        let userStats = await db.UserStats.findOne({ user })

        if (req.body.highestStreakCount > userStats.highestStreakCount) {
            userStats.highestStreakCount = req.body.highestStreakCount
            await userStats.save()
        }

        return res.status(200).json(userStats)
    } catch (err) {
        return next(err)
    }
}
