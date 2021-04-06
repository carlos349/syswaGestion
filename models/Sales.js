const mongoose = require('mongoose')
const { Schema } = mongoose

const saleSchema = new Schema({
    branch: {
        type: String
    },
    services: {
        type: Array
    },
    employe: {
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
    localGain: {
        type: Number
    },
    typesPay: {
        type: Array
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