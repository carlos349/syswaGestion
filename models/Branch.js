const mongoose = require('mongoose')
const { Schema } = mongoose

const branchSchema = new Schema({
    name: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = branchSchema