const mongoose = require('mongoose')
const { Schema } = mongoose

const closedDateSchema = new Schema ({
    branch: {
        type: String
    }, 
    services: {
        type: Array
    },
    client: {
        type: String
    },
    employe: {
        type: String
    },
    design: {
        type: Number
    },
    commission: {
        type: Number
    },
    localGain: {
        type:Number
    },
    total: {
        type: Number
    },
    discount: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = closedDateSchema