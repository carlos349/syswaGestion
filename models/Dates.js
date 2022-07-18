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
    title: {
        type: String
    },
    microServices: {
        type: Array
    },
    services: {
        type: Array
    },
    duration: {
        type: Number
    },
    split: {
        type: String
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
    extraData: {
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
    isBlocked: {
        type: Boolean
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