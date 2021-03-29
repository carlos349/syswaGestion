const moongose = require(moongose)
const { Scheme } = moongose

const endingdateScheme = new Scheme({
    services: {
        type: Array
    },
    client: {
        type: Object
    },
    branch: {
        type: String
    },
    employe: {
        type:String
    },
    design: {
        type: Number
    },
    commision: {
        type: Number
    },
    totalBranch: {
        type: Number
    },
    total: {
        type: Number
    },
    discount: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = endingdateScheme