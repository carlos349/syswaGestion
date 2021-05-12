const mongoose = require('mongoose')
const { Schema } = mongoose

const profilesSchema = new Schema({
    profiles: {
        type: Array
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = profilesSchema