const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema ({
    access: {
        type: Array
    },
    branch: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    about: {
        type: String
    },
    password: {
        type: String
    },
    status: {
        type: String
    },
    linkLender: {
        type: String
    },
    notificationLimited: {
        type: Boolean
    },
    userImage: {
        type: String
    },
    lastAccess: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = userSchema