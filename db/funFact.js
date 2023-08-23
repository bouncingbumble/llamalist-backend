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
    sequence: {
        type: Array,
        default: [],
    },
    speed: {
        default: 40,
        type: Number,
    },
    duration: {
        type: Number,
        default: 3000,
    },
})

const funFact = mongoose.model('FunFact', funFactSchema)

module.exports = funFact
