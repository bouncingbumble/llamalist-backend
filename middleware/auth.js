const jwt = require('jsonwebtoken')

//make sure user is signed in - Authneticaion
exports.loginRequired = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1] // Bearer lkjlkjlkj
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (decoded) {
                return next()
            } else {
                console.log(err)
                return next({
                    status: 401,
                    message: 'Please log in first',
                })
            }
        })
    } catch (err) {
        console.log(err)
        return next({
            status: 401,
            message: 'Please log in first',
        })
    }
}

//make sure user is who they say they are - Authorization

exports.ensureCorrectUser = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1] // Bearer lkjlkjlkj

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (decoded && decoded._id === req.params.id) {
                return next()
            } else {
                console.log(err)
                return next({
                    status: 401,
                    message: 'Unauthorized',
                })
            }
        })
    } catch (err) {
        console.log(err)
        return next({
            status: 401,
            message: 'Unauthorized',
        })
    }
}

exports.ensureAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]

        jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
            if (
                decoded &&
                process.env.OFFICE_OTTER_ADMIN.split(' ').includes(decoded._id)
            ) {
                return next()
            } else {
                console.log(error)
                return next({
                    status: 401,
                    message: 'Not Admin',
                })
            }
        })
    } catch (error) {
        console.log(error)
        return next({
            status: 401,
            message: 'Not Admin',
        })
    }
}
