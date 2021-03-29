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
        type:String
    },
    design: {
        type: Number
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