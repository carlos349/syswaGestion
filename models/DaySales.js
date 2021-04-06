const mongoose = require('mongoose')
const { Schema } = mongoose

const daySaleSchema = new Schema({
    branch: {
        type: String
    },
    services: {
        type: Array
    },
    employe: {
        type: Object
    },
    commission: {
        type: Number
    },
    typesPay: {
        type: Array
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
    idTableSales: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = daySaleSchema