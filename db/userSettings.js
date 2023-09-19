const mongoose = require('mongoose')

const userSettingsSchema = new mongoose.Schema({
    user: {
        type: String,
        default: '',
        required: true,
    },
    hideSectionWelcomeMessages: {
        default: {
            all: false,
            today: false,
            someday: false,
            upcoming: false,
            inbox: false,
        },
        type: Object,
        required: true,
    },
})

const userSettings = mongoose.model('UserSettings', userSettingsSchema)

module.exports = userSettings
