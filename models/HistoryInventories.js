const moongose = require(moongose)
const { Scheme } =  moongose

const historyInventoryScheme = new Scheme({
   user: {
       type: String
   },
   totalProduct: {
       type: Number
   },
   branch: {
       type: String
   },
   products: {
       type: Array
   },
   createdAt: {
       type: Date,
       default: Date.now
   }
})

module.exports = historyInventoryScheme