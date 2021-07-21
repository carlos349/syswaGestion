const mongoose = require('mongoose')
const { Schema } = mongoose

const branchSchema = new Schema({
    name: {
        type: String
    },
    productsCount: {
        type: Number
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = branchSchema