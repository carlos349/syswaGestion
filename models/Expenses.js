const mongoose = require('mongoose')
const { Schema } = mongoose

const expenseSchema = new Schema({
    branch: {
        type: String
    },
    detail: {
        type: String
    },
    amount: {
        type: Number
    },
    employe: {
        type: Object
    },
    type: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = expenseSchema