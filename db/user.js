const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 13

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
        default: '',
    },
    jobTitle: {
        type: String,
        default: '',
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
            default: [],
        },
    ],
    password: {
        type: String,
        select: false,
    },
    isSlackIntegrated: {
        type: Boolean,
        default: false,
    },
    isMicrosoftIntegrated: {
        type: Boolean,
        default: false,
    },
    isChromeExtIntegrated: {
        type: Boolean,
        default: false,
    },
    isEmailIntegrated: {
        type: Boolean,
        default: false,
    },
    isTextIntegrated: {
        type: Boolean,
        default: false,
    },
    slackUserId: {
        type: String,
    },
    completeSound: {
        type: String,
        default: 'ding',
    },
    stripeCustomerId: {
        type: String,
        default: '',
        require: true,
    },
    microsoftId: {
        type: String,
        default: '',
    },
})

/**
 * Pre-save hook to hash password
 */
userSchema.pre('save', async function (next) {
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
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

module.exports = User
