const mongoose = require('mongoose')
const { Schema } = mongoose

const datesBlockSchema = new Schema({
    dateData: {
        type: Object
    },
    lenderBlocks: {
        type: Array
    },
    firstBlock: {
        type: Array
    }
})

module.exports = datesBlockSchema