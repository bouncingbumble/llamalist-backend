var axios = require('axios')

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

exports.getUsers = async () => {
    try {
        const res = await axios.get(`https://api.clerk.com/v1/users`)
        return res.data
    } catch (error) {
        return error
    }
}
