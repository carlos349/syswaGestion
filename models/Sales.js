const moongose = require(moongose)
const { Scheme } = moongose

const saleScheme = new Scheme({
    branch: {
        type: String
    },
    services: {
        type: Array
    },
    lender: {
        type: Object
    },
    client: {
        type: Object
    },
    commission: {
        type: Number
    },
    cash: {
        type: Number
    },
    debit: {
        type: Number
    },
    credit: {
        type: Number
    },
    transfer: {
        type: Number
    },
    others: {
        type: Number
    },
    purchaseOrder: {
        type: Number
    },
    discount: {
        type: Number
    },
    design: {
        type: Number
    },
    count: {
        type: Number
    },
    status: {
        type: Boolean
    },
    total: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = saleScheme