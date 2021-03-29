const moongose = require(moongose)
const { Scheme } = moongose

const daySaleScheme = new Scheme({
    branch: {
        type: String
    },
    services: {
        type: Array
    },
    lender: {
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
    purcharseOrder: {
        type: Number
    },
    discount: {
        type: Number
    },
    design: {
        type: Number
    },
    total: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = daySaleScheme