const mongoose = require('mongoose')
const { Schema } = mongoose

const configurationSchema = new Schema({
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
    onlineDates: {
        type: Boolean
    },
    datesPolitics: {
        type: Object
    }
})

module.exports = configurationSchema