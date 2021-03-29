const mongoose = require('mongoose')
const { Schema } = mongoose

const dateSchema = new Schema({
    branch: {
        type: String
    },
    start: {
        type: String
    },
    end: {
        type: String
    },
    sort: {
        type: Number
    },
    services: {
        type: Array
    },
    client: {
        type: Object
    },
    employe: {
        type: String
    },
    class: {
        type: String
    },
    process: {
        type: Boolean
    },
    confirmation: {
        type: Boolean
    },
    confirmationId: {
        type: String
    },
    typePay: {
        type: String
    },
    payPdf: {
        type: String
    },
    typeCreation: {
        type: String
    },
    imgDesign: {
        type: Array
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = dateSchema