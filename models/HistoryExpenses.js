const mongoose = require('mongoose')
const { Schema } =  mongoose

const historyExpensesSchema = new Schema({
   expenses: {
       type: Array
   },
   totals: {
        type: Object
   },
   branch: {
       type: String
   },
   createdAt: {
       type: Date,
       default: Date.now
   }
})

module.exports = historyExpensesSchema