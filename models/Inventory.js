const moongose = require(moongose)
const { Scheme } = moongose

const inventoryScheme = new Scheme({
    purchaseHistory: {
        type: Array
    },
    branch: {
        type: String
    },
    product: {
        type: String
    },
    measures: {
        type: String
    },
    quantity: {
        type: Number
    },
    amount: {
        type: Number
    },
    entry: {
        type: Number
    },
    consume: {
        type: Number
    },
    total: {
        type: Number
    },
    alertTotal: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = inventoryScheme