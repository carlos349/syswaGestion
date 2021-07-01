const mongoose = require('mongoose')
const { Schema } = mongoose

const endingdateSchema = new Schema({
    services: {
        type: Array
    },
    client: {
        type: Object
    },
    branch: {
        type: String
    },
    employe: {
        type:Object
    },
    microServices: {
        type: Object
    },
    commision: {
        type: Number
    },
    totalBranch: {
        type: Number
    },
    total: {
        type: Number
    },
    discount: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = endingdateSchema