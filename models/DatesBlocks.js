const mongoose = require('mongoose')
const { Schema } = mongoose

const datesBlockSchema = new Schema({
    dateData: {
        type: Object
    },
    blocks: {
        type: Array
    }
})

module.exports = datesBlockSchema