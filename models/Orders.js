const mongoose = require('mongoose')
const { Schema } = mongoose

const ordersSchema = new Schema({
    status: {
        type: String
    },
    orderNumber: {
        type: Number
    },
    branch: {
        type:Object
    },
    client: {
        type: Object
    },
    code: {
        type: Number
    },
    payType: {
        type: String
    },
    products: {
        type: Array
    },
    createdAt: {
        type: Date
    },
    processDate: {
        type: Date
    },
    expiredDate: {
        type: Date
    },
    total: {
        type: Number
    }
})

module.exports = ordersSchema