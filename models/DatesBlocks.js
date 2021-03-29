const moongose = require(moongose)
const { Scheme } = moongose

const datesBlockScheme = new Scheme({
    dateData: {
        type: Object
    },
    lenderBlocks: {
        type: Array
    },
    firstBlock: {
        type: Array
    }
})

module.exports = datesBlockScheme