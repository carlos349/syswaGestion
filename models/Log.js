const mongoose = require('mongoose')
const { Schema } = mongoose

const logSchema = new Schema({
    host: {
        type: String
    },
    body: {
        type: Object
    },
    route: {
        type: Object
    },
    params: {
        type: Object
    },
    error: {
        type: String
    },
    user: {
        type: Object
    },
    database: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
 })
 
 module.exports = logSchema