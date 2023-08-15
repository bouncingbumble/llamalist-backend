const mongoose = require('mongoose')

// mongoose.set('debug', true)
mongoose.Promise = Promise
mongoose.connect(
    `mongodb+srv://admin:${process.env.MONGODB_ADMIN_PASSWORD}@llamalist-db.nzpujkn.mongodb.net/?retryWrites=true&w=majority`,
    {
        keepAlive: true,
        useNewUrlParser: true,
    }
)

module.exports.User = require('./user')
module.exports.Task = require('./task')
module.exports.Label = require('./label')
module.exports.UserStats = require('./userStats')
module.exports.ChecklistItem = require('./checklist')
