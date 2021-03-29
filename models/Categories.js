const mongoose = require('mongoose')
const { Schema } = mongoose

const CategorySchema = new Schema({
    name: {
        type: String
    },
    branch: {
        type: String
    }
})

module.exports = CategorySchema