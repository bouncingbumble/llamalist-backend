const mongoose = require('mongoose')

const labelSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '',
        required: true,
    },
    color: {
        type: String,
        default: '',
        required: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
})

const Label = mongoose.model('Label', labelSchema)

module.exports = Label
