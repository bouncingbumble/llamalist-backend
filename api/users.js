const db = require('../db')
const clerk = require('@clerk/clerk-sdk-node')

exports.getUserStats = async (req, res, next) => {
    const user = req.params.id
    try {
        let stats = await db.UserStats.findOne({ user })

        if (stats === null) {
            stats = await db.UserStats.create({ user })
        }

        return res.status(200).json(stats)
    } catch (err) {
        return next(err)
    }
}

exports.updateUserStats = async (req, res, next) => {
    const user = req.params.id

    //weird behavior with saving array of streak dates so we remove,

    delete req.body.currentStreak

    try {
        let updatedStats = await db.UserStats.findOneAndUpdate(
            { user },
            { ...req.body },
            { new: true }
        )

        if (req.body.fedLlama) {
            updatedStats.llamaFeedings.push(new Date())
            await updatedStats.save()
        }

        return res.status(200).json(updatedStats)
    } catch (err) {
        return next(err)
    }
}

exports.getUserOAuthTokens = async (req, res, next) => {
    const userId = req.params.id
    try {
        let token
        const googleTokens = await clerk.users.getUserOauthAccessToken(
            userId,
            'oauth_google'
        )
        if (googleTokens) {
            token = googleTokens[0]
        } else {
            // eventually we will make requests for microsoft and apple here as well
        }

        return res.status(200).json(token)
    } catch (err) {
        return next(err)
    }
}
