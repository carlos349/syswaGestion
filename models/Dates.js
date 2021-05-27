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
    content: {
        type: String
    },
    client: {
        type: Object
    },
    class: {
        type: String
    },
    employe: {
        type: Object
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
    date: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = dateSchema