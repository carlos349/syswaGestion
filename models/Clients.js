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
    block: {
        type: Boolean
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phone: {
        type: Object
    },
    extraData: {
        type: Object
    },
    instagram: {
        type: String
    },
    codeRescue: {
        type: String
    },
    attends: {
        type: Number
    },
    idRecommender: {
        type: String
    },
    recommender: {
        type: String
    },
    recommendations: {
        type: Number
    },
    clientNotes: {
        type: Array
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