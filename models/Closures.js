const moongose = require(moongose)
const { Scheme } = moongose

const closureScheme = new Scheme({
    branch: {
        type: String
    },
    manual: {
        type: Object
    },
    system: {
        type: Object
    },
    closerName: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = closureScheme