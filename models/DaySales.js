const mongoose = require('mongoose')
const { Schema } = mongoose

const daySaleSchema = new Schema({
    branch: {
        type: String
    },
    services: {
        type: Array
    },
    lender: {
        type: Object
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
    purcharseOrder: {
        type: Number
    },
    discount: {
        type: Number
    },
    design: {
        type: Number
    },
    total: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = daySaleSchema