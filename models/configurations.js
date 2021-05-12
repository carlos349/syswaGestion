const mongoose = require('mongoose')
const { Schema } = mongoose

const configurationSchema = new Schema({
    branch: {
        type: String
    },
    blockHour: {
        type: Object
    },
    blackList: {
        type: Array
    },
    businessName: {
        type: String
    },
    businessPhone: {
        type: String
    },
    businessType: {
        type: String
    },
    businessLocation: {
        type: String
    },
    additionalFeatures: {
        type: Object
    },
    typesPay: {
        type: Array
    },
    currency: {
        type: String
    },
    datesPolitics: {
        type: Object
    }
})

module.exports = configurationSchema