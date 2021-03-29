const moongose = require(moongose)
const { Scheme } = moongose

const providerScheme = new Scheme({
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

module.exports = providerScheme