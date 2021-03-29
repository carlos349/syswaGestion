const moongose = require(moongose)
const { Scheme } = moongose

const CategoryScheme = new Scheme({
    name: {
        type: String
    },
    branch: {
        type: String
    }
})

module.exports = CategoryScheme