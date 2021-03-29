const moongose = require(moongose)
const { Scheme } = moongose

const clientScheme = new Scheme({
    historical: {
        type: Array
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phone: {
        type: String
    },
    instagram: {
        type: String
    },
    attends: {
        type: Number
    },
    recommender: {
        type: String
    },
    recommendations: {
        type: Number
    },
    lastAttend: {
        type: Date
    },
    createdAt: {
        type: Date
    },
    birthday: {
        type: Date
    },
    userImg: {
        type: String
    }
})

module.exports = clientScheme