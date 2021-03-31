const mongoose = require('mongoose')
const { Schema } = mongoose

const saleSchema = new Schema({
    branch: {
        type: String
    },
    services: {
        type: Array
    },
    lender: {
        type: Object
    },
    client: {
        type: Object
    },
    payType: {
        type: String
    },
    commission: {
        type: Number
    },
    cash: {
        type: Number
    },
    debit: {
        type: Number
    },
    credit: {
        type: Number
    },
    transfer: {
        type: Number
    },
    others: {
        type: Number
    },
    purchaseOrder: {
        type: Number
    },
    discount: {
        type: Number
    },
    design: {
        type: Number
    },
    count: {
        type: Number
    },
    status: {
        type: Boolean
    },
    total: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = saleSchema