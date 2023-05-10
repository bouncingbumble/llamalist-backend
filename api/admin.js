const db = require('../db')

exports.getAllUsers = async (req, res, next) => {
    try {
        let users = await db.User.find()
        return res.status(200).json(users)
    } catch (error) {
        return res.next(error)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const updatedUser = await db.User.findByIdAndUpdate(
            req.params.userId,
            req.body,
            { new: true }
        )
        return res.status(200).json(updatedUser)
    } catch (error) {
        return next(error)
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await db.User.deleteOne({ _id: req.params.userId })
        return res.status(200).json(deletedUser)
    } catch (error) {
        return next(error)
    }
}

exports.newFeatureRefresh = async (req, res, next) => {
    try {
        console.log('sending out new feature alert to users...')

        const users = await db.User.find()
        for await (let user of users) {
            try {
                user.newFeature = true
                user.newFeatureMessage = req.body.message
                await user.save()
            } catch (error) {
                console.log(error)
            }
        }
        console.log('new feature alert looping has finished')
        io.emit('newFeature')

        return res.status(200).json()
    } catch (error) {
        return next(error)
    }
}
