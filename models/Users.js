const moongose = require(moongose)
const { scheme } = moongose

const userScheme = new Scheme ({
    access: {
        type: Array
    },
    branch: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    status: {
        type: Number
    },
    linkLender: {
        type: String
    },
    userImage: {
        type: String
    },
    lastAccess: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = userScheme