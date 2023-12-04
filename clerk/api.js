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
