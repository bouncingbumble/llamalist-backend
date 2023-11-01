var axios = require('axios')
const db = require('../db')

axios.defaults.headers.common[
    'Authorization'
] = `Bearer ${process.env.CLERK_API_KEY}`

exports.getUser = async (userId) => {
    try {
        const res = await axios.get(`https://api.clerk.com/v1/users/${userId}`)
        return res.data
    } catch (error) {
        return error
    }
}

exports.getUserByEmail = async (email) => {
    try {
        const res = await axios.get(
            `https://api.clerk.com/v1/users?email_address=${email}`
        )
        console.log(res.data)

        return res.data[0]
    } catch (error) {
        console.log(error)
        return error
    }
}

exports.getUserByPhoneNumber = async (number) => {
    let numberFormatted = number.replace(number.charAt(0), '%2B')
    try {
        const res = await axios.get(
            `https://api.clerk.com/v1/users?phone_number=${numberFormatted}`
        )

        return res.data[0]
    } catch (error) {
        console.log(error)
        return error
    }
}

exports.getUsers = async () => {
    try {
        const res = await axios.get(`https://api.clerk.com/v1/users`)
        return res.data
    } catch (error) {
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
