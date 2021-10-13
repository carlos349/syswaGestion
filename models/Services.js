const mongoose = require('mongoose')
const { Schema } = mongoose

const serviceSchema = new Schema({
    branch: {
        type: String
    },
    employes: {
        type: Array
    },
    products: {
        type: Array
    },
    name: {
        type: String
    },
    additionalName: {
        type: String
    },
    duration: {
        type: Number
    },
    price: {
        type: Number
    },
    commission: {
        type: Number
    },
    discount: {
        type: Boolean
    },
    category: {
        type: String
    },
    prepayment: {
        type: Object
    },
    active: {
        type: Boolean
    }
})

module.exports = serviceSchema