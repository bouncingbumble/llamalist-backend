const db = require('../db')

exports.getUser = async (userId) => {
    try {
        return await db.UserSettings.findById(userId)
    } catch (error) {
        return error
    }
}

exports.getUsers = async () => {
    try {
        return await db.UserSettings.find()
    } catch (error) {
        return error
    }
}

exports.getUserByEmail = async (email) => {
    try {
        const user = await db.UserSettings.findOne({ email })

        return user
    } catch (error) {
        console.log(error)
        return error
    }
}

exports.getTokenFromMsId = async (req, res, next) => {
    try {
        let token = null
        const response = await db.UserSettings.findOne({
            microsoftUserId: req.params.msId,
        })
        if (response) {
            token = await getSignInJWT(response.user)
        }
        return res.status(200).json(token)
    } catch (error) {
        return next(error)
    }
}

const getSignInJWT = async (userId) => {
    try {
        const res = await axios.post(
            'https://api.clerk.com/v1/sign_in_tokens',
            { user_id: userId }
        )
        return res.data.token
    } catch (error) {
        return error
    }
}

exports.getSignInJWT = getSignInJWT
