const mongoose = require('mongoose')
const { Schema } = mongoose

const dateBlockingSchema = new Schema({
    branch: {
        type: String
    },
    dateBlocking: {
        type: String
    },
    employe: {
        type: Object
    },
    start: {
        type: String
    },
    end: {
        type: String
    }
})

module.exports = dateBlockingSchema