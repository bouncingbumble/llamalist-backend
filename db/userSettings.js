const mongoose = require('mongoose')

const userSettingsSchema = new mongoose.Schema({
    user: {
        type: String,
        default: '',
        required: true,
    },
    phoneNumber: {
        type: String,
        default: '',
    },
    stripeCustomerId: {
        type: String,
        default: '',
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
    llamaName: {
        type: String,
        default: '',
    },
})

const userSettings = mongoose.model('UserSettings', userSettingsSchema)

module.exports = userSettings
