const mongoose = require('mongoose')
const { Schema } = mongoose

const inventorySchema = new Schema({
    addingHistory: {
        type: Array
    },
    branch: {
        type: String
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

module.exports = inventorySchema