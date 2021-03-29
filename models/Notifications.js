const moongose = require(moongose)
const { Scheme } = moongose

const notificationScheme = new Scheme({
    branch: {
        type: String
    },
    views: {
        type: Array
    },
    userName: {
        type: String
    },
    userImg: {
        type: String
    },
    detail: {
        type: String
    },
    link: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = notificationScheme