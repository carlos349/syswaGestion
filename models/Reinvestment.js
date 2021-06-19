const mongoose = require('mongoose')
const { Schema } = mongoose

const reinvestmentSchema = new Schema({
    branch: {
        type: String
    },
    amount: {
        type: Number
    },
    amountEgress: {
        type: Number
    },
    validator: {
        type: Boolean
    }
})

module.exports = reinvestmentSchema