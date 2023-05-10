const mongoose = require('mongoose')

// mongoose.set('debug', true)
mongoose.Promise = Promise
mongoose.connect(
    `mongodb+srv://LlamaListAdmin:${process.env.MONGODB_ADMIN_PASSWORD}@llamalist.xc6lzwr.mongodb.net/?retryWrites=true&w=majority`,
    {
        keepAlive: true,
        useNewUrlParser: true,
    }
)

module.exports.User = require('./user')
module.exports.Task = require('./task')
module.exports.Label = require('./label')
module.exports.ChecklistItem = require('./checklist')
