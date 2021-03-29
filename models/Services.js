const moongose = require(moongose)
const { Scheme } = moongose

const serviceScheme = new Scheme({
    branch: {
        type: String
    },
    lenders: {
        type: Array
    },
    products: {
        type: Array
    },
    name: {
        type: String
    },
    duration: {
        type: Number
    },
    price: {
        type: Number
    },
    commission: {
        type: Number
    },
    discount: {
        type: Boolean
    },
    category: {
        type: String
    },
    active: {
        type: Boolean
    }
})

module.exports = serviceScheme