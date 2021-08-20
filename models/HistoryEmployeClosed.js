const mongoose = require('mongoose')
const { Schema } =  mongoose

const historyEmployeSchema = new Schema({
    sales: {
        type: Array
    },
    bonus: {
        type: Number
    },
    advancement: {
        type: Number
    },
    commission: {
        type: Number
    },
    employe: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = historyEmployeSchema