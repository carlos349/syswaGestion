const moongose = require(moongose)
const { Scheme } = moongose

const employeScheme = new Scheme({
    days: {
        type: Array
    },
    branch: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    document: {
        type: String
    },
    commission: {
        type: Number
    },
    advancement: {
        type: Number
    },
    bonus: {
        type: Number
    },
    class: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = employeScheme