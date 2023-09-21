const mongoose = require('mongoose')

const llamaSchema = new mongoose.Schema({
    funFactIndex: {
        default: 0,
        type: Number,
    },
    funFactText: {
        default: '',
        type: String,
    },
    isCustomFunFact: {
        type: Boolean,
        default: false,
    },
    funFactSequence: {
        type: Array,
        default: [],
    },
    funFactSpeed: {
        default: 40,
        type: Number,
    },
    funFactDuration: {
        type: Number,
        default: 3000,
    },
    goldenLlamaIndex: {
        default: 0,
        type: Number,
    },
    lastGoldenLlamaUpdate: {
        type: Date,
        default: null,
    },
    previousGoldenLlamaUpdate: {
        type: Date,
        default: null,
    },
})

const llama = mongoose.model('Llama', llamaSchema)

module.exports = llama
