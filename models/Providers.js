const mongoose = require('mongoose')
const { Schema } = mongoose

const providerSchema = new Schema({
    branch: {
        type: String
    },
    name: {
        type: String
    },
    document: {
        type: String
    },
    contact: {
        type: String
    },
    contactPlus: {
        type: String
    },
    locations: {
        type: String
    }
})

module.exports = providerSchema