const mongoose = require('mongoose')
const { Schema } =  mongoose

const historyClosedInventorySchema = new Schema({
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

module.exports = historyClosedInventorySchema