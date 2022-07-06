const mongoose = require('mongoose')
const { Schema } = mongoose

const notificationSchema = new Schema({
    branch: {
        type: String
    },
    views: {
        type: Array
    },
    userName: {
        type: String
    },
    userImg: {
        type: String
    },
    employeId: {
        type: String
    },
    detail: {
        type: String
    },
    link: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = notificationSchema