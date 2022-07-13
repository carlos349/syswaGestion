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
    closeExpense: {
        type: Boolean
    },
    uuid: {
        type: Number
    },
    totals: {
        type: Object
    },
    createdAt: {
        type: Date
    }
})

module.exports = saleSchema