const mongoose = require('mongoose')
const { Schema } = mongoose

const datesBlockSchema = new Schema({
    dateData: {
        type: Object
    },
    employeBlocks: {
        type: Array
    },
    firstBlock: {
        type: Array
    }
})

module.exports = datesBlockSchema