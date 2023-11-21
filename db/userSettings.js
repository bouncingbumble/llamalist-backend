const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 13

const userSettingsSchema = new mongoose.Schema({
    email: {
        type: String,
        default: '',
        required: true,
    },
    password: {
        type: String,
        select: false,
    },
    phoneNumber: {
        type: String,
        default: '',
    },
    stripeCustomerId: {
        type: String,
        default: '',
    },
    microsoftUserId: {
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
    isPaid: {
        type: Boolean,
        default: false,
    },
})

const userSettings = mongoose.model('UserSettings', userSettingsSchema)

/**
 * Pre-save hook to hash password
 */
userSettingsSchema.pre('save', async function (next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase()
    }
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
        this.password = await bcrypt.hash(this.password, salt)
    } else {
        return next()
    }
})

/**
 * plain text password gets passed into bcrypt and hashed then compared with the users hashed password
 */
userSettingsSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

module.exports = userSettings
