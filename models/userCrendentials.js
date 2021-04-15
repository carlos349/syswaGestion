const mongoose = require('mongoose')
const { Schema } = mongoose

const credentialSchema = new Schema({
    credential: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = credentialSchema