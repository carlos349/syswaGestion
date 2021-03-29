const mongoose = require('mongoose')
const { Schema } = mongoose

const clientSchema = new Schema({
    historical: {
        type: Array
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phone: {
        type: String
    },
    instagram: {
        type: String
    },
    attends: {
        type: Number
    },
    recommender: {
        type: String
    },
    recommendations: {
        type: Number
    },
    lastAttend: {
        type: Date
    },
    createdAt: {
        type: Date
    },
    birthday: {
        type: Date
    },
    userImg: {
        type: String
    }
})

module.exports = clientSchema