const express = require('express')
const metrics = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const saleSchema = require('../models/Sales')
const dateSchema = require('../models/Dates')
const employeSchema = require('../models/Employes')
const expenseSchema = require('../models/Expenses')
const formats = require('../formats')
const cors = require('cors')
metrics.use(cors())

metrics.get('/compareSales/:branch', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)

  var dates = formats.datesMonth()
  try {
    const thisMonthSales = await Sale.find({
      $and: [
        {branch: req.params.branch},
        {createdAt: { $gte: dates.thisMonth.since+' 00:00', $lte: dates.thisMonth.until+' 24:00' }},
        {status: true}
      ]
    })
    try {
      const prevMonthSales = await Sale.find({
        $and: [
          {branch: req.params.branch},
          {createdAt: { $gte: dates.prevMonth.since+' 00:00', $lte: dates.prevMonth.until+' 24:00' }}
        ]
      })

      var totals = {
        thisMonth: 0,
        prevMonth: 0
      }

      for (const sale of thisMonthSales) {
        totals.thisMonth = totals.thisMonth + sale.totals.total
      }
      for (const sale of prevMonthSales) {
        totals.prevMonth = totals.prevMonth + sale.totals.total
      }
      console.log(totals)
      res.json({status: 'ok', data: totals})
    }catch(err){
      res.send(err)
    }
  }catch(err){
    res.send(err)
  }
})

metrics.get('/compareItems/:branch', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)

  var dates = formats.datesMonth()
  try {
    const thisMonthSales = await Sale.find({
      $and: [
        {branch: req.params.branch},
        {createdAt: { $gte: dates.thisMonth.since+' 00:00', $lte: dates.thisMonth.until+' 24:00' }},
        {status: true}
      ]
    })
    try {
      const prevMonthSales = await Sale.find({
        $and: [
          {branch: req.params.branch},
          {createdAt: { $gte: dates.prevMonth.since+' 00:00', $lte: dates.prevMonth.until+' 24:00' }}
        ]
      })

      var totals = {
        thisMonth: 0,
        prevMonth: 0
      }

      for (const sale of thisMonthSales) {
        totals.thisMonth = totals.thisMonth + sale.items.length
      }
      for (const sale of prevMonthSales) {
        totals.prevMonth = totals.prevMonth + sale.items.length
      }
      res.json({status: 'ok', data: totals})
    }catch(err){
      res.send(err)
    }
  }catch(err){
    res.send(err)
  }
})

metrics.get('/totalsTypesPays/:branch', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)

  var dates = formats.datesMonth()
  
  try{
    const findSales = await Sale.find({
      $and: [
        {branch: req.params.branch},
        {createdAt: { $gte: dates.thisMonth.since+' 00:00', $lte: dates.thisMonth.until+' 24:00' }},
        {status: true}
      ]
    })
    const typePay = []
    for (const sale of findSales) {
      typePay.push(...sale.typesPay)
    }
    
    var totalsPay = {}
    for (const pay of typePay) {
      totalsPay[pay.type] = totalsPay[pay.type] ? totalsPay[pay.type] + pay.total : pay.total
    }

    const pays = []
    Object.entries(totalsPay).forEach(element => {
        pays.push({
          type: element[0],
          total: element[1]
        })
    })
    res.json({status: 'ok', data: pays})
  }catch(err){
    res.send(err)
  }
})

metrics.post('/totalSales', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  var series = [
    {
      name:"Venta total",
      data: []
    }
  ]
  var dates = req.body.dates

  try {
    const sales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: dates[0]+' 00:00', $lte: dates[1]+' 24:00' }},
        {status: true}
      ]
    })
    var sumTotal = 0
    var salesTotals = {}
    for (const salee of sales) {
      sumTotal = sumTotal + salee.totals.total
      const dateFormat = formats.datesTime(salee.createdAt)
      if (salesTotals[dateFormat]) {
        salesTotals[dateFormat] = salesTotals[dateFormat] + salee.totals.total
      }else{
        salesTotals[dateFormat] = salee.totals.total
      }
    }
    series[0].data = Object.entries(salesTotals)
    series[0].data.forEach(element => {
      element[0] = parseInt(element[0])
    })
    res.json({status: 'ok', series: series, total: sumTotal})
  }catch(err){
    res.send(err)
  }
})

metrics.post('/totalServices', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  const Date = conn.model('dates', dateSchema)
  var series = [
    {
      name:"Servicios procesados",
      data: []
    },
    {
      name:"Servicios agendados",
      data: []
    }
  ]
  var datess = req.body.dates

  try {
    const sales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }},
        {status: true}
      ]
    })
    try {
      const dates = await Date.find({
        $and: [
          {branch: req.body.branch},
          {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }}
        ]
      })
      var servicesDate = {}
      for (const datee of dates) {
        const dateFormat = datee.createdAt.getTime()
        if (servicesDate[dateFormat]) {
          servicesDate[dateFormat]++
        }else{
          servicesDate[dateFormat] = 1
        }
      }
      var servicesSale = {}
      var sumTotal = 0
      for (const salee of sales) {
        const dateFormat = formats.datesTime(salee.createdAt)
        for (const item of salee.items) {
          if (item.type == "service") {
            sumTotal = sumTotal + 1
            if (servicesSale[dateFormat]) {
              servicesSale[dateFormat]++
            }else{
              servicesSale[dateFormat] = 1
            }
          }
        }
      }
      series[1].data = Object.entries(servicesDate)
      series[1].data.forEach(element => {
        element[0] = parseInt(element[0])
      })
      series[0].data = Object.entries(servicesSale)
      series[0].data.forEach(element => {
        element[0] = parseInt(element[0])
      })
      res.json({status: 'ok', series: series, total: sumTotal})
    }catch(err){
      res.send(err)
    }
  }catch(err){
    res.send(err)
  }
})

metrics.post('/totalByEmploye', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  const Employe = conn.model('employes', employeSchema)
  var datess = req.body.dates
  var series = []
  var totalsByEmployes = []
  try {
    const sales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }},
        {status: true}
      ]
    })
    try {
      const employes = await Employe.find({
        branch: req.body.branch
      })
      if (employes.length > 0) {
        for (const key in employes) {
          const employe = employes[key]
          series.push({name: employe.firstName+' '+employe.lastName, data: []})
          totalsByEmployes.push({name: employe.firstName+' '+employe.lastName, total: 0})
          saleTotal = {}
          for (const salee of sales) {
            const dateFormat = formats.datesTime(salee.createdAt)
            for (const item of salee.items) {
              if (item.type == "service") {
                if (item.employe.id == employe._id) {
                  if (saleTotal[dateFormat]) {
                    saleTotal[dateFormat] = saleTotal[dateFormat] + item.totalItem
                    totalsByEmployes[key].total = totalsByEmployes[key].total + item.totalItem
                  }else{
                    saleTotal[dateFormat] = item.totalItem
                    totalsByEmployes[key].total = totalsByEmployes[key].total + item.totalItem
                  }
                }
              }
            } 
          }
          series[key].data = Object.entries(saleTotal)
          series[key].data.forEach(element => {
            element[0] = parseInt(element[0])
          })
        }
        res.json({status: 'ok', series: series, totals: totalsByEmployes})
      }else{
        res.json({status: 'bad'})
      }
    }catch(err){
      res.send(err)
    }
  }catch(err){
    res.send(err)
  }
})

metrics.post('/servicesByEmploye', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  const Employe = conn.model('employes', employeSchema)
  var datess = req.body.dates
  var series = []
  var totalsByEmployes = []
  try {
    const sales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }},
        {status: true}
      ]
    })
    try {
      const employes = await Employe.find({
        branch: req.body.branch
      })
      if (employes.length > 0) {
        for (const key in employes) {
          const employe = employes[key]
          series.push({name: employe.firstName+' '+employe.lastName, data: []})
          totalsByEmployes.push({name: employe.firstName+' '+employe.lastName, total: 0})
          saleTotal = {}
          for (const salee of sales) {
            const dateFormat = formats.datesTime(salee.createdAt)
            for (const item of salee.items) {
              if (item.type == "service") {
                if (item.employe.id == employe._id) {
                  if (saleTotal[dateFormat]) {
                    saleTotal[dateFormat]++
                    totalsByEmployes[key].total = totalsByEmployes[key].total + 1
                  }else{
                    saleTotal[dateFormat] = 1
                    totalsByEmployes[key].total = totalsByEmployes[key].total + 1
                  }
                }
              }
            }
          }
          series[key].data = Object.entries(saleTotal)
          series[key].data.forEach(element => {
            element[0] = parseInt(element[0])
          })
        }
        res.json({status: 'ok', series: series, totals: totalsByEmployes})
      }else{
        res.json({status: 'bad'})
      }
    }catch(err){
      res.send(err)
    }
  }catch(err){
    res.send(err)
  }
})

metrics.post('/commissionsByEmploye', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  const Employe = conn.model('employes', employeSchema)
  var datess = req.body.dates
  var series = []
  var totalsByEmployes = []
  try {
    const sales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }},
        {status: true}
      ]
    })
    try {
      const employes = await Employe.find({
        branch: req.body.branch
      })
      if (employes.length > 0) {
        for (const key in employes) {
          const employe = employes[key]
          series.push({name: employe.firstName+' '+employe.lastName, data: []})
          totalsByEmployes.push({name: employe.firstName+' '+employe.lastName, total: 0})
          saleTotal = {}
          for (const salee of sales) {
            const dateFormat = formats.datesTime(salee.createdAt)
            for (const item of salee.items) {
              if (item.type == "service") {
                if (item.employe.id == employe._id) {
                  if (saleTotal[dateFormat]) {
                    saleTotal[dateFormat] = saleTotal[dateFormat] + item.employe.commission
                    totalsByEmployes[key].total = totalsByEmployes[key].total + item.employe.commission
                  }else{
                    saleTotal[dateFormat] = item.employe.commission
                    totalsByEmployes[key].total = totalsByEmployes[key].total + item.employe.commission
                  }
                }
              }
            }
          }
          series[key].data = Object.entries(saleTotal)
          series[key].data.forEach(element => {
            element[0] = parseInt(element[0])
          })
        }
        res.json({status: 'ok', series: series, totals: totalsByEmployes})
      }else{
        res.json({status: 'bad'})
      }
    }catch(err){
      res.send(err)
    }
  }catch(err){
    res.send(err)
  }
})

metrics.post('/totalExpenses', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Expense = conn.model('expenses', expenseSchema)
  var datess = req.body.dates
  var series = [
    {
      name:"Bono",
      data: []
    },
    {
      name:"Mensual",
      data: []
    },
    {
      name: "Inventario",
      data: []
    },
    {
      name: "Comision",
      data: []
    }
  ]
  var totalsByExpense = []
  var totalExpeses = 0
  try {
    const expenses = await Expense.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }}
      ]
    })
    if (expenses.length > 0) {
      for (const key in series) {
        const serie = series[key]
        var dict = {}
        totalsByExpense.push({type: serie.name, total: 0})
        for (const expense of expenses) {
          const dateFormat = expense.createdAt.getTime()
          totalExpeses = key == 0 ? totalExpeses + expense.amount : totalExpeses
          if (serie.name == expense.type) {
            if (dict[dateFormat]) {
              dict[dateFormat] = dict[dateFormat] + expense.amount
              totalsByExpense[key].total = totalsByExpense[key].total + expense.amount
            }else{
              dict[dateFormat] = expense.amount
              totalsByExpense[key].total = totalsByExpense[key].total + expense.amount
            }
          }
        }
        serie.data = Object.entries(dict)
        serie.data.forEach(element => {
          element[0] = parseInt(element[0])
        })
      }
      
      res.json({status: 'ok', series: series, totalsByExpense: totalsByExpense, totalExpeses: totalExpeses})
    }else{
      res.json({status: 'bad'})
    }
  }catch(err){
    res.send(err)
  }
})

metrics.post('/diaryPromedies', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  let categories = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  let series = [
    {
      name: "Producción",
      data:[0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: "Servicios",
      data:[0, 0, 0, 0, 0, 0, 0],
    }
  ]
  const datess = req.body.dates
  try {
    const sales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }},
        {status: true}
      ]
    })

    for (const salee of sales) {
      const date = salee.createdAt.getDay()
      series[0].data[date] = series[0].data[date] + salee.totals.total
      for (const item of salee.items) {
        if (item.type == "service") {
          series[1].data[date]++
        }
      }
    }

    res.json({status: 'ok', series: series, categories: categories})
  }catch(err){
    res.send(err)
  }
})

module.exports = metrics