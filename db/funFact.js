const mongoose = require('mongoose')

const funFactSchema = new mongoose.Schema({
    index: {
        default: 0,
        type: Number,
    },
    funFact: {
        default: '',
        type: String,
    },
    isCustom: {
        type: Boolean,
        default: false,
    },
})

const funFact = mongoose.model('FunFact', funFactSchema)

module.exports = funFact
