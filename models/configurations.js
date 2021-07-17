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
        type: Object
    },
    businessType: { 
        type: String
    },
    businessLocation: {
        type: String
    },
    bussinessLogo: { 
        type: String
    },
    businessEmail: {
        type: String
    },
    typesPay: {
        type: Array
    },
    currency: {
        type: String
    },
    datesPolitics: {
        type: Object
    },
    microServices: {
        type: Array
    }
})

module.exports = configurationSchema