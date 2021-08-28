const express = require('express')
const metrics = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const saleSchema = require('../models/Sales')
const dateSchema = require('../models/Dates')
const employeSchema = require('../models/Employes')
const expenseSchema = require('../models/Expenses')
const historyExpensesSchema = require('../models/HistoryExpenses')
const projectionSchema = require('../models/ProjectionDays')
const closureSchema = require('../models/Closures')
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

metrics.get('/getDays/:branch', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Closure = conn.model('closures', closureSchema)
  const dates = formats.datesMonth()

  try {
    const closures = await Closure.find({
      $and: [
        {branch: req.params.branch},
        {createdAt: { $gte: dates.thisMonth.since+' 00:00', $lte: dates.thisMonth.until+' 24:00' }}
      ]
    }).count()
    res.json({status: 'ok', quantity: closures})
  }catch(err){
    res.send(err)
  }
})

metrics.get('/getProjection/:branch', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Projection = conn.model('projectiondays', projectionSchema)

  try {
    const projection = await Projection.findOne({
      branch: req.params.branch
    })
    if(projection){
      res.json({status: 'ok', data: projection})
    }else{
      try {
        const projectionCreate = await Projection.create({
          branch: req.params.branch,
          days: 0
        })
        res.json({status: 'ok', data: projectionCreate})
      }catch(err){
        res.send(err)
      }
    }
  }catch(err){
    res.send(err)
  }
})

metrics.get('/getExpensesTotal/:branch', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Expense = conn.model('expenses', expenseSchema)
  const dates = formats.datesMonth()

  try {
    const expenses = await Expense.find({
      $and: [
        {branch: req.params.branch},
        {createdAt: { $gte: dates.thisMonth.since+' 00:00', $lte: dates.thisMonth.until+' 24:00' }}
      ]
    })
    var total = 0
    for (const expense of expenses) {
      total = total + expense.amount
    }
    res.json({status: 'ok', total: total})
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

metrics.post('/totalsTypesPays', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)

  var dates = req.body.dates
  var series = [{
    name:"Total de pago",
    data: []
  }]
  var categories = []
  try{
    const findSales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: dates[0]+' 00:00', $lte: dates[1]+' 24:00' }},
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
    
    for (const pay of pays) {
      categories.push(pay.type)
      series[0].data.push(pay.total)
    }
    res.json({status: 'ok', series: series, categories: categories})
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
        const dateFormat = formats.datesTime(datee.createdAt)
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
  var series = [{
    name:"Totales",
    data: []
  }]
  var categories = []
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
          totalsByEmployes.push({name: employe.firstName+' '+employe.lastName, total: 0})
          for (const salee of sales) {
            for (const item of salee.items) {
              if (item.type == "service") {
                if (item.employe.id == employe._id) {
                  totalsByEmployes[key].total = totalsByEmployes[key].total + item.totalItem
                }
              }
            }
          }
          categories.push(totalsByEmployes[key].name)
          series[0].data.push(totalsByEmployes[key].total)
        }
        res.json({status: 'ok', series: series, categories: categories})
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

metrics.post('/totalPerService', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  var datess = req.body.dates
  var series = []
  var labels = []
  try {
    const sales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }},
        {status: true}
      ]
    })
    // console.log(sales)
    var dataService = {}
    for (const sale of sales) {
      for (const item of sale.items) {
        if (item.type == "service") {
          if (dataService[item.item.name]) {
            dataService[item.item.name] = dataService[item.item.name] + 1
          }else{
            dataService[item.item.name] = 1
          }
        }
      }
    }
    const dataServiceArray = Object.entries(dataService)
    for (const service of dataServiceArray) {
      labels.push(service[0])
      series.push(service[1])
    }
    res.json({status: 'ok', series:series, labels: labels})
  }catch(err){
    res.send(err)
  }
})

metrics.post('/totalPerProducts', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  var datess = req.body.dates
  var series = []
  var labels = []
  try {
    const sales = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: datess[0]+' 00:00', $lte: datess[1]+' 24:00' }},
        {status: true}
      ]
    })
    // console.log(sales)
    var dataService = {}
    for (const sale of sales) {
      for (const item of sale.items) {
        if (item.type == "product") {
          if (dataService[item.item.name]) {
            dataService[item.item.name] = dataService[item.item.name] + parseInt(item.quantityProduct)
          }else{
            dataService[item.item.name] = parseInt(item.quantityProduct)
          }
        }
      }
    }
    const dataServiceArray = Object.entries(dataService)
    for (const service of dataServiceArray) {
      labels.push(service[0])
      series.push(service[1])
    }
    res.json({status: 'ok', series:series, labels: labels})
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
  var series = [{
    name:"Servicios",
    data: []
  }]
  var categories = []
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
          totalsByEmployes.push({name: employe.firstName+' '+employe.lastName, total: 0})
          for (const salee of sales) {
            for (const item of salee.items) {
              if (item.type == "service") {
                if (item.employe.id == employe._id) {
                  totalsByEmployes[key].total = totalsByEmployes[key].total + 1
                }
              }
            }
          }
          categories.push(totalsByEmployes[key].name)
          series[0].data.push(totalsByEmployes[key].total)
        }
        res.json({status: 'ok', series: series, categories: categories})
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
  var series = [{
    name:"Comisión",
    data: []
  }]
  var categories = []
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
          totalsByEmployes.push({name: employe.firstName+' '+employe.lastName, total: 0})
          for (const salee of sales) {
            for (const item of salee.items) {
              if (item.type == "service") {
                if (item.employe.id == employe._id) {
                  totalsByEmployes[key].total = totalsByEmployes[key].total + item.employe.commission
                }
              }
            }
          }
          categories.push(totalsByEmployes[key].name)
          series[0].data.push(totalsByEmployes[key].total)
        }
        res.json({status: 'ok', series: series, categories: categories})
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
  var categories = ['Bono', 'Mensual', 'Inventario', 'Comision']
  var series = [
    {
      name:"Gastos",
      data: [0, 0, 0, 0]
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
      for (const key in categories) {
        const serie = categories[key]
        var dict = {}
        totalsByExpense.push({type: serie, total: 0})
        for (const expense of expenses) {
          const dateFormat = expense.createdAt.getTime()
          totalExpeses = key == 0 ? totalExpeses + expense.amount : totalExpeses
          if (serie == expense.type) {
            totalsByExpense[key].total = totalsByExpense[key].total + expense.amount
          }
        }
      }
      
      for (const total in series[0].data) {
        console.log(totalsByExpense[total].total)
        series[0].data[total] = totalsByExpense[total].total.toFixed(2)
      }
      
      res.json({status: 'ok', series: series, totalExpeses: totalExpeses, categories: categories})
    }else{
      res.json({status: 'bad'})
    }
  }catch(err){
    res.send(err)
  }
})

metrics.post('/diaryTotals', protectRoute, async (req, res) => {
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
    var days = [0, 0, 0, 0, 0, 0, 0]
    var getTime = {}
    for (const salee of sales) {
      const date = salee.createdAt.getDay()
      const dateRepeat = salee.createdAt.getDate()+''+salee.createdAt.getMonth()+''+salee.createdAt.getFullYear()
      series[0].data[date] = series[0].data[date] + salee.totals.total
      if (getTime[dateRepeat]) {
        getTime[dateRepeat] = true
      }else{
        days[date] = days[date] + 1
        getTime[dateRepeat] = true
      }
      for (const item of salee.items) {
        if (item.type == "service") {
          series[1].data[date]++
        }
      }
    }
    console.log(days)
    for (const key in days) {
      if (days[key] > 0 && series[0].data[key] > 0) {
        series[0].data[key] = series[0].data[key] / days[key]
        series[1].data[key] = series[1].data[key] / days[key]
        series[0].data[key] = parseFloat(series[0].data[key].toFixed(2))
        series[1].data[key] = parseFloat(series[1].data[key].toFixed(2))
      }
    }

    res.json({status: 'ok', series: series, categories: categories})
  }catch(err){
    res.send(err)
  }
})

//charts by years

metrics.post('/anualProduction', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  const dates = formats.anualDates()
  const categories = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const series = [
    {
      name: "Año actual",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: 'Año pasado',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ]
  console.log(dates)
  try {
    const thisYear = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: dates.formatThisYear[0], $lte: dates.formatThisYear[1] }},
        {status: true}
      ]
    })
    try {
      const prevYear = await Sale.find({
        $and: [
          {branch: req.body.branch},
          {createdAt: { $gte: dates.formatPrevYear[0], $lte: dates.formatPrevYear[1] }},
          {status: true}
        ]
      })

      for (const sale of thisYear) {
        const monthAndYear = sale.createdAt.getMonth()
        series[0].data[monthAndYear] = series[0].data[monthAndYear] + sale.totals.total   
      }

      for (const sale of prevYear) {
        const monthAndYear = sale.createdAt.getMonth()
        series[1].data[monthAndYear] = series[1].data[monthAndYear] + sale.totals.total   
      }

      res.json({status: 'ok', series: series, categories: categories})
    }catch(err){
      res.send(err)
    }
  }catch(err){
    res.send(err)
  }
})


metrics.post('/anualServices', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  const dates = formats.anualDates()
  const categories = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const series = [
    {
      name: "Servicios",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ]

  try {
    const thisYear = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: dates.formatThisYear[0], $lte: dates.formatThisYear[1] }},
        {status: true}
      ]
    })

    for (const sale of thisYear) {
      const monthAndYear = sale.createdAt.getMonth()
      for (const item of sale.items) {
        if (item.type == "service") {
          if (item.item._id == req.body.id) {
            series[0].data[monthAndYear] = series[0].data[monthAndYear] + 1
          }
        }
      }  
    }

    res.json({status: 'ok', series: series, categories: categories})
  }catch(err){
    res.send(err)
  }
})


metrics.post('/dataEmploye', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Sale = conn.model('sales', saleSchema)
  const Employe = conn.model('employes', employeSchema)
  const dates = formats.anualDates()
  const categories = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const series = [
    {
      name: "Producción",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: "Comisión",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: "Servicios",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ]
  
  try {
    const thisYear = await Sale.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: dates.formatThisYear[0], $lte: dates.formatThisYear[1] }},
        {status: true}
      ]
    })

    for (const sale of thisYear) {
      const monthAndYear = sale.createdAt.getMonth()
      for (const item of sale.items) {
        if (item.type == "service") {
          if (item.employe.id == req.body.id) {
            series[0].data[monthAndYear] = series[0].data[monthAndYear] + item.totalItem
            series[1].data[monthAndYear] = series[1].data[monthAndYear] + item.employe.commission
            series[2].data[monthAndYear] = series[2].data[monthAndYear] + 1
          }
        }
      }
    }
    res.json({status: 'ok', series: series, categories: categories})
  }catch(err){
    res.send(err)
  }
})

metrics.post('/dataExpense', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const HistoryExpense = conn.model('historyexpenses', historyExpensesSchema)
  const dates = formats.anualDates()
  const categories = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const series = [
    {
      name: "Gastos",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: "Ganancia",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ]
  
  try {
    const thisYear = await HistoryExpense.find({
      $and: [
        {branch: req.body.branch},
        {createdAt: { $gte: dates.formatThisYear[0], $lte: dates.formatThisYear[1] }}
      ]
    })

    for (const history of thisYear) {
      const monthAndYear = history.createdAt.getMonth()
      console.log(monthAndYear)
      series[0].data[monthAndYear] = series[0].data[monthAndYear] + history.totals.expenses
      series[1].data[monthAndYear] = series[1].data[monthAndYear] + history.totals.totalFinal
    }
    res.json({status: 'ok', series: series, categories: categories})
  }catch(err){
    res.send(err)
  }
})

metrics.put('/updateProjection/:id', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  const Projection = conn.model('projectiondays', projectionSchema)

  try {
    const projection = await Projection.findByIdAndUpdate(req.params.id, {
      $set: {
        days: req.body.days
      }
    })
    res.json({status: 'ok'})
  }catch(err){
    res.send(err)
  }
})

module.exports = metrics