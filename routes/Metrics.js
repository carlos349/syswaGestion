const express = require('express');
const metrics = express.Router()
const mongoose = require('mongoose')
const cors = require('cors');
const protectRoute = require('../securityToken/verifyToken')
const serviceSchema = require('../models/Services')
const categorySchema = require('../models/Categories')
const employeSchema = require('../models/Employes')
const expenseSchema = require('../models/Expenses')
const clientSchema = require('../models/Clients')
const saleSchema = require('../models/Dates')
metrics.use(cors())

metrics.get('/top', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Client = conn.model('clients', clientSchema)
    try {
        const attends = await Client.find().sort({attends: -1}).limit(10)
        res.json({status: 'ok', data: attends, token: req.requestToken})
    }catch(err){
        res.send(err)
    }
})

metrics.get('/dailyProduction/:date', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Sale = conn.model('sales', saleSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let series = [
      {
        name:"Venta total",
        data: []
      },
      {
        name: 'Totales',
        data: []
      }
    ]
    let dataTable = []
    
    try {
        const sales = await Sale.find({
        $and: [
            {branch: req.body.branch},
            {createdAt: {$gte:split[0] , $lte: finalDate}},
            {status: true}
        ]}).sort({createdAt: 1})
        if (sales.length > 0) {
            var sumDay = 0
            var sumTotal = 0
            for (let index = 0; index < sales.length; index++) {
                sumTotal = sumTotal + sales[index].total
                let date = sales[index].createdAt
                let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
                let dateTimeFormat = date.getTime()
                let datePrev, dateFormatPrev, dateTimeFormatPrev
                if (index > 0) {
                    datePrev = sales[index - 1].createdAt
                    dateTimeFormatPrev = datePrev.getTime()
                    dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
                }
                
                if (index > 0 ) {
                    if (dateFormat == dateFormatPrev) {
                        sumDay = sales[index].total + sumDay
                        if ((index+1) == sales.length) {
                            series[0].data.push([dateTimeFormat, sumDay])
                            dataTable.push({fecha: dateFormat, total: sumDay})
                        }
                    }else{
                        series[0].data.push([dateTimeFormatPrev,sumDay])
                        dataTable.push({fecha: dateFormatPrev, total: sumDay})
                        sumDay = 0
                        sumDay = sales[index].total
                        if ((index+1) == sales.length) {
                            series[0].data.push([dateTimeFormat, sumDay])
                            dataTable.push({fecha: dateFormat, total: sumDay})
                        }
                    }
                }else{
                    sumDay = sales[index].total
                    if (sales.length == 1) {
                        series[0].data.push([dateTimeFormat, sumDay])
                        dataTable.push({fecha: dateFormat, total: sumDay})
                    }
                }
            }
            var sumTotals = 0
            for (let indexTwo = 0; indexTwo < series[0].data.length; indexTwo++) {
                const element = series[0].data[indexTwo];
                sumTotals = sumTotals + element[1]
                series[1].data.push([element[0], sumTotals])
            }
            res.json({status: 'ok', series: series, dataTable: dataTable, token: req.requestToken})
        }else{
            res.json({status: 'bad', series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/total', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Sale = conn.model('sales', saleSchema)

    const dateAfter = new Date()
    formatDate = (dateAfter.getMonth() + 1)+'-01-'+dateAfter.getFullYear()
    formatDateTwo = (dateAfter.getMonth() + 1)+'-31-'+dateAfter.getFullYear()
    dateAfter.setMonth(dateAfter.getMonth() - 1)
    formatDatePrev = (dateAfter.getMonth() + 1)+'-01-'+dateAfter.getFullYear()
    formatDateTwoPrev = (dateAfter.getMonth() + 1)+'-31-'+dateAfter.getFullYear()

    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte: formatDate, $lte: formatDateTwo}},
                {status: true}
            ]
        })
        var count = 0
        for (let index = 0; index < sales.length; index++) {
            const element = sales[index];
            count = count + element.services.length
        }
        try {
            const salesPrev = await Sale.find({
                $and: [
                    {createdAt: {$gte: formatDatePrev, $lte: formatDateTwoPrev}},
                    {status: true}
                ]
            })
            var countPrev = 0
            for (let indexTwo = 0; indexTwo < salesPrev.length; indexTwo++) {
                const elementTwo = salesPrev[indexTwo];
                countPrev = countPrev + elementTwo.services.length
            }
            res.json({status: 'ok', count: count, countPrev: countPrev, token: req.requestToken})
        }catch(err){
            res.send(err)
        }
    }catch(err){
        res.send(err)
    }
})


metrics.get('/dailyExpenseGainTotal/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Sale = conn.model('sales', saleSchema)
    const Expense = conn.model('expenses', expenseSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let series = [
      {
        name: "Total de ventas",
        data: []
      },
      {
        name: "Total de ganancias",
        data: []
      },
      {
        name: "Gastos",
        data: []
      }
    ]
    const dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales) {
          var sumTotal = 0
          var sumGain = 0
          for (let index = 0; index < sales.length; index++) {
            let date = sales[index].createdAt
            let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
            let dateTimeFormat = date.getTime()
            let datePrev, dateFormatPrev, dateTimeFormatPrev
            if (index > 0) {
              datePrev = sales[index - 1].createdAt
              dateTimeFormatPrev = datePrev.getTime()
              dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
            }
            if (index > 0 ) {
              if (dateFormat == dateFormatPrev) {
                sumTotal = sales[index].total + sumTotal
                sumGain = sales[index].localGain + sumGain
                if ((index+1) == sales.length) {
                  series[0].data.push([dateTimeFormat, sumTotal])
                  series[1].data.push([dateTimeFormat, sumGain])
                  dataTable.push({Fecha: dateFormat, Tipo: 'Total venta', Monto: sumTotal})
                  dataTable.push({Fecha: dateFormat, Tipo: 'Total ganancias', Monto: sumGain})
                }
              }else{
                series[0].data.push([dateTimeFormatPrev, sumTotal])
                series[1].data.push([dateTimeFormatPrev, sumGain])
                dataTable.push({Fecha: dateFormatPrev, Tipo: 'Total venta', Monto: sumTotal})
                dataTable.push({Fecha: dateFormatPrev, Tipo: 'Total ganancias', Monto: sumGain})
                sumTotal = 0
                sumGain = 0
                sumTotal = sales[index].total
                sumGain = sales[index].localGain
                if ((index+1) == sales.length) {
                  series[0].data.push([dateTimeFormat, sumTotal])
                  series[1].data.push([dateTimeFormat, sumGain])
                  dataTable.push({Fecha: dateFormat, Tipo: 'Total venta', Monto: sumTotal})
                  dataTable.push({Fecha: dateFormat, Tipo: 'Total ganancias', Monto: sumGain})
                }
              }
            }else{
              sumTotal = sales[index].total
              sumGain = sales[index].localGain
              if (sales.length == 1) {
                series[0].data.push([dateTimeFormat, sumTotal])
                series[1].data.push([dateTimeFormat, sumGain])
                dataTable.push({Fecha: dateFormat, Tipo: 'Total venta', Monto: sumTotal})
                dataTable.push({Fecha: dateFormat, Tipo: 'Total ganancias', Monto: sumGain})
              }
            }
          }
          const expenses = await Expense.find({
                $and: [
                    {branch: req.body.branch},
                    {createdAt: {$gte: split[0] , $lte: finalDate}}
                ]
          }).sort({createdAt: 1})
          if (expenses) {
            var sumExpense = 0
            for (let indexTwo = 0; indexTwo < expenses.length; indexTwo++) {
              let date = expenses[indexTwo].createdAt
              let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
              let dateTimeFormat = date.getTime()
              let datePrev, dateFormatPrev, dateTimeFormatPrev
              if (indexTwo > 0) {
                datePrev = expenses[indexTwo - 1].createdAt
                dateTimeFormatPrev = datePrev.getTime()
                dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
              }
              if (indexTwo > 0 ) {
                if (dateFormat == dateFormatPrev) {
                  sumExpense = expenses[indexTwo].amount + sumExpense
                  if ((indexTwo+1) == expenses.length) {
                    series[2].data.push([dateTimeFormat, sumExpense])
                    dataTable.push({Fecha: dateFormat, Tipo: 'Gasto', Monto: sumExpense})
                  }
                }else{
                  series[2].data.push([dateTimeFormatPrev, sumExpense])
                  dataTable.push({Fecha: dateFormatPrev, Tipo: 'Gasto', Monto: sumExpense})
                  sumExpense = 0
                  sumExpense = expenses[indexTwo].amount
                  if ((indexTwo+1) == expenses.length) {
                    series[2].data.push([dateTimeFormat, sumExpense])
                    dataTable.push({Fecha: dateFormat, Tipo: 'Gasto', Monto: sumExpense})
                  }
                }
              }else{
                sumExpense = expenses[indexTwo].amount
                if (sales.length == 1) {
                  series[2].data.push([dateTimeFormat, sumExpense])
                  dataTable.push({Fecha: dateFormat, Tipo: 'Gasto', Monto: sumExpense})
                }
              }
            }
            res.json({status: 'ok', series:series, dataTable:dataTable, token: req.requestToken})
          }
        }else{
          res.json({status: 'bad',series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/dailyServices/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Sale = conn.model('sales', saleSchema)

    const split = req.params.date.split(':')
    var dateAfter
    var finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let series = [
      {
        name: 'Servicios totales', 
        data: []
      },
      {
        name: 'Tendencia',
        data: []
      }
    ]
    let dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          var sumDay = 0
          var sumTotal = 0
          for (let index = 0; index < sales.length; index++) {
            sumTotal = sumTotal + sales[index].services.length
            let date = sales[index].createdAt
            let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
            let dateTimeFormat = date.getTime()
            let datePrev, dateFormatPrev, dateTimeFormatPrev
            if (index > 0) {
              datePrev = sales[index - 1].createdAt
              dateTimeFormatPrev = datePrev.getTime()
              dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
            }
            if (index > 0 ) {
              if (dateFormat == dateFormatPrev) {
                sumDay = sales[index].services.length + sumDay
                if ((index+1) == sales.length) {
                  series[0].data.push([dateTimeFormat, sumDay])
                  dataTable.push({Fecha: dateFormat, Cantidad: sumDay})
                }
              }else{
                series[0].data.push([dateTimeFormatPrev, sumDay])
                dataTable.push({Fecha: dateFormatPrev, Cantidad: sumDay})
                sumDay = 0
                sumDay = sales[index].services.length
                if ((index+1) == sales.length) {
                  series[0].data.push([dateTimeFormat, sumDay])
                  dataTable.push({Fecha: dateFormat, Cantidad: sumDay})
                }
              }
            }else{
              sumDay = sales[index].services.length
              if (sales.length == 1) {
                series[0].data.push([dateTimeFormat, sumDay])
                dataTable.push({Fecha: dateFormat, Cantidad: sumDay})
              }
            }
          }
          var sumTotals = 0
          for (let indexTwo = 0; indexTwo < series[0].data.length; indexTwo++) {
            const element = series[0].data[indexTwo];
            sumTotals = sumTotals + element[1]
            series[1].data.push([element[0], sumTotals])
          }
          res.json({status: 'ok', series:series, dataTable: dataTable, token: req.requestToken})
        }else{
          res.json({status: 'bad', series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/quantityProductionPerLender/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)
    const Employe = conn.model('employes', employeSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let quantity = []
    let series = []
    let dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          const lenders = await Employe.find({branch: req.body.branch})
          if (lenders) {
            for (let indexTwo = 0; indexTwo < lenders.length; indexTwo++) {
              series.push({name: lenders[indexTwo].firstName, data: []})
              var sumDay = 0
              for (let index = 0; index < sales.length; index++) {
                let date = sales[index].createdAt
                let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
                let dateTimeFormat = date.getTime()
                let datePrev, dateFormatPrev, dateTimeFormatPrev
                if (index > 0) {
                  datePrev = sales[index - 1].createdAt
                  dateTimeFormatPrev = datePrev.getTime()
                  dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
                }
                let name = false
                name = lenders[indexTwo].firstName == sales[index].employe.name ? true : false
                if (index > 0 ) {
                    if (dateFormat == dateFormatPrev) {
                      if (name) {
                        sumDay = sales[index].total + sumDay
                      }
                      if ((index+1) == sales.length) {
                        if(sumDay > 0){
                          series[indexTwo].data.push([dateTimeFormat, sumDay])
                          dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                        }
                      }
                    }else{
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormatPrev, sumDay])
                        dataTable.push({Fecha: dateFormatPrev, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                        sumDay = 0
                      }
                      if (name) {
                        sumDay = sales[index].total
                      }
                      if ((index+1) == sales.length) {
                        if(sumDay > 0){
                          series[indexTwo].data.push([dateTimeFormat, sumDay])
                          dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                        }
                      }
                    }
                }else{
                  if (name) {
                    sumDay = sales[index].total
                    if (sales.length == 1) {
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                        sumDay = 0
                      }
                    }
                  }
                }
              }
            }
            res.json({status: 'ok', series: series, dataTable:dataTable, token: req.requestToken})
          }
        }else{
          res.json({status: 'bad', series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/dailyDesign/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)
    const Employe = conn.model('employes', employeSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let quantity = []
    let series = []
    let dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          const lenders = await Employe.find()
          if (lenders) {
            for (let indexTwo = 0; indexTwo < lenders.length; indexTwo++) {
              series.push({name: lenders[indexTwo].firstName, data: []})
              var sumDay = 0
              for (let index = 0; index < sales.length; index++) {
                let date = sales[index].createdAt
                let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
                let dateTimeFormat = date.getTime()
                let datePrev, dateFormatPrev, dateTimeFormatPrev
                if (index > 0) {
                    datePrev = sales[index - 1].createdAt
                    dateTimeFormatPrev = datePrev.getTime()
                    dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
                }
                let name = false
                let sumDesign = 0
                name = lenders[indexTwo].firstName == sales[index].employe.name ? true : false
                sumDesign = lenders[indexTwo].firstName == sales[index].employe.name ? sales[index].design : 0
                
                if (index > 0 ) {
                  if (dateFormat == dateFormatPrev) {
                    if (name) {
                      sumDay = sumDesign + sumDay
                    }
                    if ((index+1) == sales.length) {
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                        sumDay = 0
                      }
                    }
                    
                  }else{
                    if(sumDay > 0){
                      series[indexTwo].data.push([dateTimeFormatPrev, sumDay])
                      dataTable.push({Fecha: dateFormatPrev, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      sumDay = 0
                    }
                    if (name) {
                      sumDay = sumDesign
                    }
                    if ((index+1) == sales.length) {
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      }
                    }
                  }
                }else{
                  if (name) {
                    sumDay = sumDesign
                    if (sales.length == 1) {
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      }
                    }
                  }
                }
              }
            }
            res.json({status: 'ok', series: series, dataTable:dataTable, token: req.requestToken})
          }
        }else{
          res.json({status: 'bad',series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/quantityComissionPerLender/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)
    const Employe = conn.model('employes', employeSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let quantity = []
    let series = []
    let dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          const lenders = await Employe.find({branch: req.body.branch})
          if (lenders) {
            for (let indexTwo = 0; indexTwo < lenders.length; indexTwo++) {
              series.push({name: lenders[indexTwo].firstName, data: []})
              var sumDay = 0
              for (let index = 0; index < sales.length; index++) {
                let date = sales[index].createdAt
                let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
                let dateTimeFormat = date.getTime()
                let datePrev, dateFormatPrev
                if (index > 0) {
                  datePrev = sales[index - 1].createdAt
                  dateTimeFormatPrev = datePrev.getTime()
                  dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
                }
                let name = false
                let totalComission = 0
                name = lenders[indexTwo].nombre == sales[index].employe.name ? true : false
                totalComission = lenders[indexTwo].nombre == sales[index].employe.name ? sales[index].commission : 0
                
                if (index > 0 ) {
                  if (dateFormat == dateFormatPrev) {
                    if (name) {
                      sumDay = totalComission + sumDay
                    }
                      if ((index+1) == sales.length) {
                        if(sumDay > 0){
                          series[indexTwo].data.push([dateTimeFormat, sumDay])
                          dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                        }
                      }
                  }else{
                    if(sumDay > 0){
                      series[indexTwo].data.push([dateTimeFormatPrev, sumDay])
                      dataTable.push({Fecha: dateFormatPrev, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      sumDay = 0
                    }
                    if (name) {
                      sumDay = totalComission
                    }
                    if ((index+1) == sales.length) {
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      }
                    }
                  }
                }else{
                  if (name) {
                    sumDay = totalComission
                    if (sales.length == 1) {
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      }
                    }
                  }
                }
              }
            }
            res.json({status: 'ok', series: series, dataTable: dataTable, token: req.requestToken})
          }
        }else{
          res.json({status: 'bad',series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/quantityServicesPerLender/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)
    const Employe = conn.model('employes', employeSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let quantity = []
    let series = []
    let dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          const lenders = await Employe.find({branch: req.body.branch})
          if (lenders) {
            for (let indexTwo = 0; indexTwo < lenders.length; indexTwo++) {
              series.push({name: lenders[indexTwo].firstName, data: []})
              var sumDay = 0
              for (let index = 0; index < sales.length; index++) {
                let date = sales[index].createdAt
                let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
                let dateTimeFormat = date.getTime()
                let datePrev, dateFormatPrev
                if (index > 0) {
                  datePrev = sales[index - 1].createdAt
                  dateTimeFormatPrev = datePrev.getTime()
                  dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
                }
                let name = false
                let totalServices = 0
                name = lenders[indexTwo].firstName == sales[index].employe.name ? true : false
                totalServices = lenders[indexTwo].firstName == sales[index].employe.name ? sales[index].services.length : 0
    
                if (index > 0 ) {
                  if (dateFormat == dateFormatPrev) {
                    if (name) {
                      sumDay = totalServices + sumDay
                    }
                      if ((index+1) == sales.length) {
                        if(sumDay > 0){
                          series[indexTwo].data.push([dateTimeFormat, sumDay])
                          dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                        }
                      }
                
                  }else{
                    if(sumDay > 0){
                      series[indexTwo].data.push([dateTimeFormatPrev, sumDay])
                      dataTable.push({Fecha: dateFormatPrev, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      sumDay = 0
                    }
                    if (name) {
                      sumDay = totalServices
                    }
                    if ((index+1) == sales.length) {
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      }
                    }
                  }
                }else{
                  if (name) {
                    sumDay = totalServices
                    if (sales.length == 1) {
                      if(sumDay > 0){
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Prestadora: lenders[indexTwo].firstName, Monto: sumDay})
                      }
                    }
                  }
                }
              }
            }
            res.json({status: 'ok', series: series, dataTable: dataTable, token: req.requestToken})
          }
        }else{
          res.json({status: 'bad',series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})
  
metrics.post('/detailPerLender/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)
    const Employe = conn.model('employes', employeSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
        dateAfter = new Date(split[0])
        dateAfter.setDate(dateAfter.getDate() + 1)
        finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
        const dateGood = new Date(split[1])
        dateGood.setDate(dateGood.getDate() + 1)
        finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    const lender = req.body.employe
    let quantity = []
    let series = [
        {
            name: 'Total producido', 
            data: []
        },
        {
            name: 'Comisión', 
            data: []
        },
        {
            name: 'Sevicios', 
            data: []
        }
    ]
    let dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
            var sumDayServices = 0
            var sumDayProduction = 0
            var sumDayComission = 0
            for (let index = 0; index < sales.length; index++) {
            let date = sales[index].createdAt
            let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
            let dateTimeFormat = date.getTime()
            let datePrev, dateFormatPrev
            if (index > 0) {
                datePrev = sales[index - 1].createdAt
                dateTimeFormatPrev = datePrev.getTime()
                dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
            }
            let name = false
            let totalServices = 0
            let totalProduction = 0
            let totalComision = 0
            name = lender == sales[index].employe.name ? true : false
            totalServices = lender == sales[index].employe.name ? sales[index].services.length : 0
            totalProduction = lender == sales[index].employe.name ? sales[index].total : 0
            totalComision = lender == sales[index].employe.name ? sales[index].commission : 0
        
                if (index > 0 ) {
                    if (dateFormat == dateFormatPrev) {
                        if (name) {
                            sumDayProduction = totalProduction + sumDayProduction
                            sumDayComission = totalComision + sumDayComission
                            sumDayServices = totalServices + sumDayServices
                        }
                        if ((index+1) == sales.length) {
                            if(sumDayProduction > 0 && sumDayComission > 0 && sumDayServices > 0){
                                series[0].data.push([dateTimeFormat, sumDayProduction])
                                series[1].data.push([dateTimeFormat, sumDayComission])
                                series[2].data.push([dateTimeFormat, sumDayServices])
                                dataTable.push({Fecha: dateFormat, totalProduction: sumDayProduction, totalComision: sumDayComission, totalServices: sumDayServices})
                            }
                        }
                    }else{
                        if(sumDayProduction > 0 && sumDayComission > 0 && sumDayServices > 0){
                            series[0].data.push([dateTimeFormatPrev, sumDayProduction])
                            series[1].data.push([dateTimeFormatPrev, sumDayComission])
                            series[2].data.push([dateTimeFormatPrev, sumDayServices])
                            dataTable.push({Fecha: dateFormatPrev, totalProduction: sumDayProduction, totalComision: sumDayComission, totalServices: sumDayServices})
                            sumDayProduction = 0
                            sumDayComission = 0
                            sumDayServices = 0
                        }
                        if (name) {
                            sumDayProduction = totalProduction
                            sumDayComission = totalComision
                            sumDayServices = totalServices
                        }
                        if ((index+1) == sales.length) {
                            if(sumDayProduction > 0 && sumDayComission > 0 && sumDayServices > 0){
                            series[0].data.push([dateTimeFormat, sumDayProduction])
                            series[1].data.push([dateTimeFormat, sumDayComission])
                            series[2].data.push([dateTimeFormat, sumDayServices])
                            dataTable.push({Fecha: dateFormat, totalProduction: sumDayProduction, totalComision: sumDayComission, totalServices: sumDayServices})
                            }
                        }
                    }
                }else{
                    if (name) {
                        sumDayProduction = totalProduction
                        sumDayComission = totalComision
                        sumDayServices = totalServices
                        if (sales.length == 1) {
                            if(sumDayProduction > 0 && sumDayComission > 0 && sumDayServices > 0){
                            series[0].data.push([dateTimeFormat, sumDayProduction])
                            series[1].data.push([dateTimeFormat, sumDayComission])
                            series[2].data.push([dateTimeFormat, sumDayServices])
                            dataTable.push({Fecha: dateFormat, totalProduction: sumDayProduction, totalComision: sumDayComission, totalServices: sumDayServices})
                            }
                        }
                    }
                }
            }
            res.json({status: 'ok', series: series, dataTable: dataTable, token: req.requestToken})
        }else{
            res.json({status: 'bad', series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.post('/detailPerService/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    const service = req.body.service
    let quantity = []
    let series = [
      {
        name: service, 
        data: []
      }
    ]
    let dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          var sumDayServices = 0
          for (let index = 0; index < sales.length; index++) {
            let date = sales[index].createdAt
            let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
            let dateTimeFormat = date.getTime()
            let datePrev, dateFormatPrev
            if (index > 0) {
              datePrev = sales[index - 1].createdAt
              dateTimeFormatPrev = datePrev.getTime()
              dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
            }
            let name = false
            let totalServices = 0
            for (let indexThree = 0; indexThree < sales[index].services.length; indexThree++) {
              name = service == sales[index].services[indexThree].service ? true : false
              totalServices = service == sales[index].services[indexThree].service ? totalServices + sales[index].services[indexThree].price : totalServices
            }
            
            if (index > 0 ) {
              if (dateFormat == dateFormatPrev) {
                if (name) {
                  sumDayServices = totalServices + sumDayServices
                }
                  if ((index+1) == sales.length) {
                    if(sumDayServices > 0){ 
                      series[0].data.push([dateTimeFormat, sumDayServices])
                      dataTable.push({Fecha: dateFormat, total: sumDayServices})
                    }
                  }
              }else{
                if(sumDayServices > 0){
                  series[0].data.push([dateTimeFormatPrev, sumDayServices])
                  dataTable.push({Fecha: dateFormatPrev, total: sumDayServices})
                  sumDayServices = 0
                }
                if (name) {
                  sumDayServices = totalServices
                }
                if ((index+1) == sales.length) {
                  if(sumDayServices > 0){
                    series[0].data.push([dateTimeFormat, sumDayServices])
                    dataTable.push({Fecha: dateFormat, total: sumDayServices})
                  }
                }
              }
            }else{
              if (name) {
                sumDayServices = totalServices
                if (sales.length == 1) {
                  if(sumDayServices > 0){
                    series[0].data.push([dateTimeFormat, sumDayServices])
                    dataTable.push({Fecha: dateFormat, total: sumDayServices})
                  }
                }
              }
            }
          }
          res.json({status: 'ok', series: series, dataTable: dataTable, token: req.requestToken})
        }else{
          res.json({status: 'bad', series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/quantityServicesPerService/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)
    const Service = conn.model('services', serviceSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let quantity = []
    let series = []
    let dataTable = []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          const Services = await Service.find({branch: req.body.branch})
          if (Services) {
            for (let indexTwo = 0; indexTwo < Services.length; indexTwo++) {
              series.push({name: Services[indexTwo].name, data: []})
              var sumDay = 0
              for (let index = 0; index < sales.length; index++) {
                let date = sales[index].createdAt
                let dateFormat = date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate()
                let dateTimeFormat = date.getTime()
                let datePrev, dateFormatPrev
                if (index > 0) {
                  datePrev = sales[index - 1].createdAt
                  dateTimeFormatPrev = datePrev.getTime()
                  dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
                }
                let name = false
                let totalServices = 0
                name = Services[indexTwo].name == sales[index].services[indexThree].service ? true : false
                totalServices = Services[indexTwo].name == sales[index].services[indexThree].service ? 1 : 0
            
                if (index > 0 ) {
                  if (dateFormat == dateFormatPrev) {
                    if (name) {
                      sumDay = totalServices + sumDay
                    }
                      if ((index+1) == sales.length) {
                        if (sumDay > 0) {
                          series[indexTwo].data.push([dateTimeFormat, sumDay])
                          dataTable.push({Fecha: dateFormat, Servicio: Services[indexTwo].name, Cantidad: sumDay})
                        }
                      }
                  }else{
                    if (sumDay > 0) {
                      series[indexTwo].data.push([dateTimeFormatPrev, sumDay])
                      dataTable.push({Fecha: dateFormatPrev, Servicio: Services[indexTwo].name, Cantidad: sumDay})
                    }
                    sumDay = 0
                    if (name) {
                      sumDay = totalServices
                    }
                    if ((index+1) == sales.length) {
                      if (sumDay > 0) {
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Servicio: Services[indexTwo].name, Cantidad: sumDay})
                      }
                    }
                  }
                }else{
                  if (name) {
                    sumDay = totalServices
                    if (sales.length == 1) {
                      if (sumDay > 0) {
                        series[indexTwo].data.push([dateTimeFormat, sumDay])
                        dataTable.push({Fecha: dateFormat, Servicio: Services[indexTwo].name, Cantidad: sumDay})
                      }
                    }
                  }
                }
              }
            }
            res.json({status: 'ok', series: series, dataTable: dataTable, token: req.requestToken})
          }
        }else{
          res.json({status: 'bad', series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/dailyQuantityPerDay/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
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
    let dataTable =  []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          var sumDay = 0
          for (let index = 0; index < sales.length; index++) {
            let date = sales[index].createdAt.getDay()
            series[0].data[date] = series[0].data[date] + sales[index].total
            series[1].data[date] = series[1].data[date] + sales[index].services.length
          }
          for (let indexTwo = 0; indexTwo < categories.length; indexTwo++) {
            dataTable.push({Dia: categories[indexTwo], Servicios: series[1].data[indexTwo],'Produccion': series[0].data[indexTwo]})
          }
          res.json({status: 'ok', series:series, categories:categories, dataTable: dataTable, token: req.requestToken})
        }else{
          res.json({status: 'bad', series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/dailyAveragePerDay/:date', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Sale = conn.model('sales', saleSchema)

    const split = req.params.date.split(':')
    var dateAfter, finalDate
    if (split[1] == 'not') {
      dateAfter = new Date(split[0])
      dateAfter.setDate(dateAfter.getDate() + 1)
      finalDate = (dateAfter.getMonth() + 1)+'-'+dateAfter.getDate()+'-'+dateAfter.getFullYear()
    }else{
      const dateGood = new Date(split[1])
      dateGood.setDate(dateGood.getDate() + 1)
      finalDate = dateGood.getFullYear()+'-'+(dateGood.getMonth() + 1)+'-'+dateGood.getDate()
    }
    let categories = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    let totals = [ 
      {
        data:[{sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}]
      },
      {
        data:[{sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}, {sum: 0, Quantity: 0}]
      }
    ]
    let series = [
      {
        name: "Produccion",
        data:[],
      },
      {
        name: "Servicios",
        data:[],
      }
    ]
    let dataTable =  []
    try {
        const sales = await Sale.find({
            $and: [
                {branch: req.body.branch},
                {createdAt: {$gte:split[0] , $lte: finalDate}},
                {status: true}
            ]
        }).sort({createdAt: 1})
        if (sales.length > 0) {
          for (let index = 0; index < sales.length; index++) {
            let date = sales[index].createdAt.getDay()
            let dateValid = sales[index].createdAt
            let dateFormat = dateValid.getFullYear()+'-'+(dateValid.getMonth() + 1)+'-'+dateValid.getDate()
            let datePrev, dateFormatPrev
            if (index > 0) {
              datePrev = sales[index - 1].createdAt
              dateFormatPrev = datePrev.getFullYear()+'-'+(datePrev.getMonth() + 1)+'-'+datePrev.getDate()
            }else{
              dateFormatPrev = dateFormat
              totals[0].data[date].Quantity = totals[0].data[date].Quantity + 1
              totals[1].data[date].Quantity = totals[1].data[date].Quantity + 1
            }
            totals[0].data[date].sum = parseFloat(totals[0].data[date].sum) + parseFloat(sales[index].total)
            totals[1].data[date].sum = parseFloat(totals[1].data[date].sum) + parseFloat(sales[index].servicios.length)
            if (dateFormat != dateFormatPrev) {
              totals[0].data[date].Quantity = totals[0].data[date].Quantity + 1
              totals[1].data[date].Quantity = totals[1].data[date].Quantity + 1
            }
            
          }
          
          for (let indexTwo = 0; indexTwo < 7; indexTwo++) {
            if (totals[0].data[indexTwo].sum == 0) {
              series[0].data.push(0) 
              series[1].data.push(0)
            }else{
              series[0].data.push((totals[0].data[indexTwo].sum / totals[0].data[indexTwo].Quantity).toFixed(2)) 
              series[1].data.push((totals[1].data[indexTwo].sum / totals[1].data[indexTwo].Quantity).toFixed(2))
            }
            dataTable.push({Dia: categories[indexTwo], Servicios: series[1].data[indexTwo], Produccion: series[0].data[indexTwo]})
          }
          res.json({status: 'ok', series:series, categories:categories, dataTable: dataTable, token: req.requestToken})
        }else{
          res.json({status: 'bad', series: series, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/getTopTenBestClients', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Client = conn.model('clients', clientSchema)

    let categories = []
    let series = [
      {
        name: "Clientes",
        data: []
      }
    ]
    let dataTable = []
    try {
        const topClients = await Client.find().sort({attends: -1}).limit(10)
        if (topClients) {
            for (let indexTwo = 0; indexTwo < topClients.length; indexTwo++) {
                categories.push(topClients[indexTwo].firstName)
                series[0].data.push(topClients[indexTwo].attends)
                dataTable.push({Cliente: topClients[indexTwo].firstName, contacto: topClients[indexTwo].email, atencion: topClients[indexTwo].attends})
            }
            res.json({status: 'ok', series: series, categories: categories, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

metrics.get('/getTopTenBestClientsRecommendations', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const Client = conn.model('clients', clientSchema)

    let categories = []
    let series = [
      {
        name: "Clientes",
        data: []
      }
    ]
    let dataTable = []
    try {
        const topClients = await Client.find().sort({recommendations: -1}).limit(10)
        if (topClients) {
            for (let indexTwo = 0; indexTwo < topClients.length; indexTwo++) {
                categories.push(topClients[indexTwo].firstName)
                series[0].data.push(topClients[indexTwo].recommendations)
                dataTable.push({Cliente: topClients[indexTwo].firstName, contacto: topClients[indexTwo].email, recomendaciones: topClients[indexTwo].recommendations})
            }
            res.json({status: 'ok', series: series, categories:categories, dataTable: dataTable, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})
module.exports = metrics