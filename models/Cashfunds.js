const moongose = require(moongose)
const { Scheme } = moongose

const cashfundScheme = new Scheme({
    branch: {
        type: String
    },
    userRegister: {
        type: String
    },
    amount: {
        type: Number
    },
    amountEgress: {
        type: Number
    },
    quantity: {
        type: Number
    },
    validator: {
        type: Boolean
    }
})

module.exports = cashfundScheme