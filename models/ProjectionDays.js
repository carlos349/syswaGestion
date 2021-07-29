const mongoose = require('mongoose')
const { Schema } = mongoose

const projectionSchema = new Schema({
    branch: {
        type: String
    },
    days: {
        type: Number
    }
})

module.exports = projectionSchema