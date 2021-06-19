const mongoose = require('mongoose')
const { Schema } = mongoose

const saleSchema = new Schema({
    branch: {
        type: String
    },
    items: {
        type: Array
    },
    client: {
        type: Object
    },
    localGain: {
        type: Number
    },
    typesPay: {
        type: Array
    },
    purchaseOrder: {
        type: Number
    },
    count: {
        type: Number
    },
    status: {
        type: Boolean
    },
    expenseValid: {
        type: Boolean
    },
    totals: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = saleSchema