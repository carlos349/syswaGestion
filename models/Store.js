const mongoose = require('mongoose')
const { Schema } = mongoose

const storeSchema = new Schema({
    purchaseHistory: {
        type: Array
    },
    product: {
        type: String
    },
    measure: {
        type: String
    },
    quantity: {
        type: Number
    },
    price: {
        type: Number
    },
    entry: {
        type: Number
    },
    consume: {
        type: Number
    },
    total: {
        type: Number
    },
    alertTotal: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = storeSchema