const mongoose = require('mongoose')
const { Schema } = mongoose

const providerSchema = new Schema({
    branch: {
        type: String
    },
    name: {
        type: String
    },
    document: {
        type: String
    },
    contact: {
        type: Object
    },
    contactPlus: {
        type: String
    },
    location: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = providerSchema