const mongoose = require('mongoose')
const { Schema } = mongoose

const categorySchema = new Schema({
    name: {
        type: String
    },
    branch: {
        type: String
    }
})

module.exports = categorySchema