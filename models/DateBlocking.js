const mongoose = require('mongoose')
const { Schema } = mongoose

const dateBlockingSchema = new Schema({
    branch: {
        type: String
    },
    dateBlocking: {
        type: String
    },
    dateBlockings: {
        type: Date
    },
    employe: {
        type: Object
    },
    start: {
        type: String
    },
    dateId: {
        type: String
    },
    end: {
        type: String
    }
})

module.exports = dateBlockingSchema