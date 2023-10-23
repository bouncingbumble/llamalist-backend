const mongoose = require('mongoose')

mongoose.Promise = Promise
mongoose.connect(
    `mongodb+srv://admin:${process.env.MONGODB_ADMIN_PASSWORD}@llamalist-db.nzpujkn.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`,
    {
        keepAlive: true,
        useNewUrlParser: true,
    }
)

module.exports.Task = require('./task')
module.exports.Label = require('./label')
module.exports.Llama = require('./llama')
module.exports.UserStats = require('./userStats')
module.exports.ChecklistItem = require('./checklist')
module.exports.UserSettings = require('./userSettings')
