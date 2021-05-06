const express = require('express')
const sales = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const saleSchema = require('../models/Sales')
const closureSchema = require('../models/Closures')
const cashfundSchema = require('../models/CashFunds')
const daySaleSchema = require('../models/DaySales')
const closedDateSchema = require('../models/ClosedDates')
const employeSchema = require('../models/Employes')
const clientSchema = require('../models/Clients')
const dateSchema = require('../models/Dates')
const configurationSchema = require('../models/Configurations')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
const cors = require('cors')
const { CredentialProviderChain } = require('aws-sdk')

sales.use(cors())

// input - null
// output - status, data, token
sales.get('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Sale = conn.model('sales', saleSchema)
    try {
        const getSales = await Sale.find({branch: req.params.branch})
        if (getSales.length > 0) {
            res.json({status: 'ok', data: getSales, token: req.requestToken})
        }else{
            res.json({status: 'bad', data: getSales, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})
 // input - params id, pasar id
//  output - status, data and token
sales.get('/getSale/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Sale = conn.model('sales', saleSchema)

    try{ 
        const findSale = await Sale.findById(req.params.id)
        if (findSale) {
            res.json({status: 'ok', data: findSale, token: req.requestToken})
        }else{
            res.json({status: 'sale does exist', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

// input - params id, pasar id
//  output - status, data and token
sales.get('/getClosing/:id', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })
  const Closure = conn.model('closures', closureSchema)

  try{ 
      const findSale = await Closure.findById(req.params.id)
      if (findSale) {
          res.json({status: 'ok', data: findSale, token: req.requestToken})
      }else{
          res.json({status: 'sale does exist', token: req.requestToken})
      }
  }catch(err){
      res.send(err)
  }
})

//input - null
//output - status, data and token
sales.get('/Closing/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Closure = conn.model('closures', closureSchema)

    try {
        const findClosures = await Closure.find({branch: req.params.branch}).sort({createdAt: -1})
        if (findClosures.length > 0) {
            res.json({status: 'ok', data: findClosures, token: req.requestToken})
        }else{
            res.json({status: 'closures does exist'})
        }
    }catch(err){
        res.send(err)
    }
})

//input - form with branch
//output - status, data and token
sales.get('/getClosingDay/:branch', protectRoute, async(req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const DaySale = conn.model('daySales', daySaleSchema)
    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const getConfiguration = await Configuration.findOne({branch: req.params.branch})
        if (getConfiguration) {
            const data = getConfiguration.typesPay
            var totalTypePay = []
            var TypesPay = []
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                totalTypePay.push({
                    type: element,
                    total: 0
                })
                TypesPay.push({
                  type: element,
                  total: 0
              })
            }
            try {
                const getDaySales = await DaySale.find({branch: req.params.branch})
                if (getDaySales.length > 0) {
                    for (let i = 0; i < totalTypePay.length; i++) {
                        const element = totalTypePay[i];
                        for (let index = 0; index < getDaySales.length; index++) {
                            const elementTwo = getDaySales[index];
                            for (let e = 0; e < elementTwo.typesPay.length; e++) {
                                const elementThree = elementTwo.typesPay[e];
                                if (element.type == elementThree.type) {
                                  element.total = element.total + elementThree.total
                                }
                            }
                        }
                    }
                    var total = 0
                    totalTypePay.forEach(element => {
                        total = total + element.total
                    });
                    totalTypePay.push({
                        type: 'Total',
                        total: total
                    })
                    res.json({status: 'ok', data: {totals: totalTypePay, types: TypesPay}, token: req.requestToken})
                }else{
                    res.json({status: 'bad'})
                }
            }catch(err){
                res.send(err)
            }
        }else{
            res.json({status: 'configuration does exist'})
        }
    }catch(err){
        res.send(err)
    }
})

// input - null
//output - status, data and token
sales.get('/dataChecker', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Sale = conn.model('sales', saleSchema)

    const dateDaily = new Date()
    const dateDailyToday = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() + 1)+"-"+dateDaily.getDate()
    dateDaily.setDate(dateDaily.getDate() + 1)
    const dailyTomorrow = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() + 1)+"-"+dateDaily.getDate()

    try{
        const getSales = await Sale.find({
            $and: [
                {createdAt: { $gte: dateDailyToday, $lte: dailyTomorrow }},
                {status: true}
            ]
        })
        if (getSales.length > 0) {
            res.json({status: 'ok', data: getSales, token: req.requestToken})
        }else{
            res.json({status: 'not found sales'})
        }
    }catch(err){
        res.send(err)
    }
})

sales.post('/findSalesByDate', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })
  const Sale = conn.model('sales', saleSchema)

  const dates = req.body.dates
  const splitDates = dates.split(':')
  const since = splitDates[0]
  const until = new Date(splitDates[1] + ' 10:00') 
  until.setDate(until.getDate() + 1)
  const goodUntil =  (until.getMonth() + 1)+"-"+until.getDate()+"-"+until.getFullYear()
  
  try {
      const Sales = await Sale.find({
        $and: [
          {createdAt: { $gte: since, $lte: goodUntil }},
          {branch: req.body.branch}
        ]
      })
      if (Sales.length == 0) {
          res.json({status: 'sales does exist'})
      }else{
          res.json({status: 'ok', data: Sales, token: req.requestToken})
      }
  }catch(err) {
      res.send(err)
  }
})

//input - params id . pasar id
//output - status, data and token
sales.post('/findSalesByDay', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })
  const Sale = conn.model('sales', saleSchema)

  const dates = req.body.dates
  const splitDates = dates.split(':')
  const since = splitDates[0]
  const until = splitDates[1] 
  try {
    const Sales = await Sale.find({
        $and: [
            {createdAt: { $gte: since, $lte: until }},
            {branch: req.body.branch}
        ]
    })
    if (Sales.length == 0) {
        res.json({status: 'sales does exist'})
    }else{
        res.json({status: 'ok', data: Sales, token: req.requestToken})
    }
  } catch(err) {
      res.send(err)
  }
})

// input - form with rangeExcel, lenderSelect, clientSelect
// output - status, dataTable and token
sales.post('/generateDataExcel', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Sale = conn.model('sales', saleSchema)

    const data = {
      rangeExcel: req.body.rangeExcel, 
      lenderSelect: req.body.lenderSelect, 
      clientSelect: req.body.clientSelect,
      firstDate: '', 
      lastDate: ''
    }

    if (data.rangeExcel.split(' a ')) {
      const split = data.rangeExcel.split(' a ')
      data.firstDate = split[0]
      const DateUsage = new Date(split[1])
      DateUsage.setDate(DateUsage.getDate() + 1)
      data.lastDate = (DateUsage.getMonth() + 1)+"-"+DateUsage.getDate()+"-"+DateUsage.getFullYear()
    }else{
      const split = data.rangeExcel.split(':')
      const DateUsage = new Date(split[0])
      data.firstDate = split[0]
      DateUsage.setDate(DateUsage.getDate() + 1)
      data.lastDate = (DateUsage.getMonth() + 1)+"-"+DateUsage.getDate()+"-"+DateUsage.getFullYear()
    }
  
    var dataTable = []
    if (data.clientSelect == '' && data.lenderSelect == '' ) {
        try {
            const sales = await Sale.find({
                $and: [
                  {createdAt: {$gte: data.firstDate, $lte: data.lastDate}},
                  {status:true}
                ]
            })
            if(sales.length > 0){
              for (let index = 0; index < sales.length; index++) {
                const element = sales[index];
                var services = ''
                for (let indexTwo = 0; indexTwo < element.services.length; indexTwo++) {
                  const elementTwo = element.services[indexTwo];
                  if (indexTwo == 0) {
                    services = elementTwo.service
                  }else{
                    services = services + ',' + elementTwo.service
                  }
                }
                var typesPay = ''
                for (let ind = 0; ind < element.typesPay.length; ind++) {
                    const elementTwo = element.typesPay[ind];
                    if (elementTwo.total > 0) {
                      typesPay = typesPay + elementTwo.type + ':' + elementTwo.total + ' '
                    }
                }
                const formatDate = element.createdAt.getDate()+"-"+(element.createdAt.getMonth() + 1)+"-"+element.createdAt.getFullYear()
                dataTable.push({'id de ventas': 'V-'+element.count, Fecha: formatDate, Empleado: element.employe.name, Cliente: element.client.name, servicios: services, Descuento: element.discount+'%', Diseño: element.design, Comisión: element.commission, typesPay})
              }
              res.json({status: 'ok', dataTable: dataTable, token: req.requestToken})
            }else{
              res.json({status: 'bad'})
            }
        }catch(err){
            res.send(err)
        }
    }else{
      if(data.clientSelect == '' || data.clientSelect == null){
            try {
                const sales = await Sale.find({
                    $and: [
                        {createdAt: {$gte: data.firstDate, $lte: data.lastDate}},
                        {'employe.name': { $regex: data.lenderSelect, $options: 'i'}},
                        {status:true}
                    ]
                })
                if(sales.length > 0){
                    for (let index = 0; index < sales.length; index++) {
                        const element = sales[index];
                        var services = ''
                        for (let indexTwo = 0; indexTwo < element.services.length; indexTwo++) {
                            const elementTwo = element.services[indexTwo];
                            if (indexTwo == 0) {
                                services = elementTwo.service
                            }else{
                                services = services + ',' + elementTwo.service
                            }
                        }
                        var typesPay = ''
                        for (let ind = 0; ind < element.typesPay.length; ind++) {
                            const elementTwo = element.typesPay[ind];
                            if (elementTwo.total > 0) {
                              typesPay = typesPay + elementTwo.type + ':' + elementTwo.total + ' '
                            }
                        }
                        const formatDate = element.createdAt.getDate()+"-"+(element.createdAt.getMonth() + 1)+"-"+element.createdAt.getFullYear()
                        dataTable.push({'id de ventas': 'V-'+element.count, Fecha: formatDate, Empleado: element.employe.name, Cliente: element.client.name, servicios: services, Descuento: element.discount+'%', Diseño: element.design, Comision: element.commission, typesPay})
                    }
                    res.json({status: 'ok', dataTable: dataTable, token: req.requestToken})
                }else{
                    res.json({status: 'bad'})
                }
            }catch(err){
                res.send(err)
            }
      }else if (data.lenderSelect == '' || data.lenderSelect == null) {
        try {
            const sales = await Sale.find({
                $and: [
                    {createdAt: {$gte: data.firstDate, $lte: data.lastDate}},
                    {'client.email': data.clientSelect },
                    {status:true}
                ]
            })
            if(sales.length > 0){
                for (let index = 0; index < sales.length; index++) {
                    const element = sales[index];
                    var services = ''
                    for (let indexTwo = 0; indexTwo < element.services.length; indexTwo++) {
                        const elementTwo = element.services[indexTwo];
                        if (indexTwo == 0) {
                            services = elementTwo.service
                        }else{
                            services = services + ',' + elementTwo.service
                        }
                    }
                    var typesPay = ''
                    for (let ind = 0; ind < element.typesPay.length; ind++) {
                        const elementTwo = element.typesPay[ind];
                        if (elementTwo.total > 0) {
                          typesPay = typesPay + elementTwo.type + ':' + elementTwo.total + ' '
                        }
                    }
                    const formatDate = element.createdAt.getDate()+"-"+(element.createdAt.getMonth() + 1)+"-"+element.createdAt.getFullYear()
                    dataTable.push({'id de ventas': 'V-'+element.count, Fecha: formatDate, Empleado: element.employe.name, Cliente: element.client.name, servicios: services, Descuento: element.discount+'%', Diseño: element.design, Comision: element.commission, typesPay})
                }
                res.json({status: 'ok', dataTable: dataTable, token: req.requestToken})
            }else{
                res.json({status: 'bad'})
            }
        }catch(err){
            res.send(err)
        }
      }
    }
})

sales.get('/getFund/:branch', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const CashFund = conn.model('cashfunds', cashfundSchema)

    try {
      const getFund = await CashFund.findOne({branch: req.params.branch})
      if (getFund) {
        res.json({status: 'ok', data: getFund, token: req.requestToken})
      }else{
        res.json({status: 'bad', token: req.requestToken})
      }
    }catch(err){
      res.send(err)
    }
})

// input - params id, form with branch, manual and system
// ouput - status and token 
sales.post('/closeDay/:name', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const CashFund = conn.model('cashfunds', cashfundSchema)
    const DaySale = conn.model('daySales', daySaleSchema)
    const Closure = conn.model('closures', closureSchema)
    
    const manual = []
    const system = []

    manual.push({
      type: 'Fondo de caja',
      total: req.body.entryFund
    })
    manual.push({
      type: 'Efectivo',
      total: req.body.cash
    })
    manual.push({
      type: 'Egreso de caja',
      total: req.body.egressManual
    })
    manual.push({
      type: 'Total efectivo',
      total: req.body.entryFund + req.body.cash - req.body.egressManual
    })
    system.push({
      type: 'Fondo de caja',
      total: req.body.entryFund
    })
    system.push({
      type: 'Efectivo',
      total: req.body.system[0].total
    })
    system.push({
      type: 'Egreso de caja',
      total: req.body.egressManual
    })
    system.push({
      type: 'Total efectivo',
      total: req.body.entryFund + req.body.system[0].total - req.body.egressManual
    })
    for(typesManual of req.body.manual){
      if (typesManual.type != 'Efectivo') {
        manual.push({
          type: typesManual.type,
          total: typesManual.total
        })
      }
    }
    for(typesSystem of req.body.system){
      if (typesSystem.type != 'Efectivo') {
        system.push({
          type: typesSystem.type,
          total: typesSystem.total
        })
      }
    }
    const CloseDay = {
        branch: req.body.branch,
        manual: manual,
        system: system,
        closerName: req.params.name,
        createdAt: new Date()
    }

    try {
        const closed = await Closure.create(CloseDay)
        if (closed) {
            try {
                const removeSales = await DaySale.deleteMany({branch: req.body.branch})
                if (removeSales) {
                    try {
                        const reloadFunds = await CashFund.findOneAndUpdate({branch: req.body.branch}, {
                            $set: {
                                userRegister: '',
                                amount: 0, 
                                amountEgress: 0,
                                validator: false
                            }
                        })
                        if (reloadFunds) {
                            res.json({status: 'ok', token: req.requestToken})
                        }
                        res.json({status: 'bad'})
                    }catch(err){
                        res.send(err)
                    }
                }
                res.json({status: 'bad'})
            }catch(err){
                res.send(err)
            }
        }
        res.json({status: 'bad'})
    }catch(err){
        res.send(err)
    }
})

// input - form with branch, arrayClosedDates
// ouput - status and token 
sales.post('/processEndDates', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const CashFund = conn.model('cashfunds', cashfundSchema)
    const DaySale = conn.model('daySales', daySaleSchema)
    const Sale = conn.model('sales', saleSchema)
    const ClosedDates = conn.model('closedDates', closedDateSchema)
    const Client = conn.model('clients', clientSchema)
    const Employe = conn.model('employes', employeSchema)

    CashFund.find({branch: req.body.branch})
    .then(have => {
      if (have.length > 0) {
        if (have[0].validator) {
            Sale.find({branch: req.body.branch}).sort({count: -1}).limit(1)
            .then(countSale =>{
              var count = countSale[0].count + 1
              for (let i = 0; i < req.body.arrayClosedDates.length; i++) {
                    const element = req.body.arrayClosedDates[i];
                    var dataSales = {
                        branch: element.branch,
                        client: element.client,
                        employe: element.employe,
                        services: element.services,
                        commission: element.commission,
                        payType: element.payType,
                        typesPay: element.typesPay,
                        discount: element.discount,
                        purchaseOrder: element.purchaseOrder,
                        localGain: element.localGain,
                        design: element.design,
                        count: count+i,
                        status: true,
                        total: element.total,
                        createdAt: new Date()
                  }
                  Sale.create(dataSales)
                  .then(sales=>{})
                  ClosedDates.findByIdAndRemove(element.id)
                  .then(ready =>{})
                  Client.updateOne({email: element.client.split(" / ")[1]},{
                    $inc: {participacion: 1},
                    $set: {ultimaFecha: dataSales.createdAt},
                    $push: {historical: dataSales}
                  })
                  .then(clients =>{})
                  Employe.findByIdAndUpdate(element.employe.id,{
                    $inc: {commission: element.commission}
                  }) 
                  .then(clients =>{}) 
                }
                setTimeout(() => {
                  Sale.find({branch: req.body.branch}).sort({count: -1}).limit(req.body.arrayClosedDates.length)
                  .then(forDay =>{
                    for (let index = 0; index < forDay.length; index++) {
                      const element = forDay[index];
                      var dataDay = {
                        branch: element.branch,
                        services: element.services,
                        employe: element.employe,
                        commission: element.commission,
                        typesPay: element.typesPay,
                        idTableSales: element._id,
                        purcharseOrder: element.purcharseOrder,
                        discount: element.discount,
                        design: element.design,
                        total: element.total,
                        createdAt: new Date()
                      }
                      DaySale.create(dataDay)
                      .then(ventaDia =>{
                      })
                    }
                  })
                }, 5000);
                res.json({status:'sale register', token: req.requestToken})
            })
        }
        else{
          res.json({status:'no-cash'})
        }
      }else{
        CashFund.create({
            branch: req.body.branch,
            userRegister: '',
            amount: 0,
            amountEgress: 0,
            quantity: 0,
            validator: false
        }).then(createCash => {
          res.json({status: 'no-cash'})
        })
      }
    })
})

// input - form with total, branch, services, employe, client, payType, typesPay, purchaseOrder, discount, design, ifProcess, date
// ouput - status and token
sales.post('/process', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const CashFund = conn.model('cashfunds', cashfundSchema)
    const DaySale = conn.model('daySales', daySaleSchema)
    const Sale = conn.model('sales', saleSchema)
    const ClosedDates = conn.model('closedDates', closedDateSchema)
    const Client = conn.model('clients', clientSchema)
    const Employe = conn.model('employes', employeSchema)
    const Dates = conn.model('dates', dateSchema)

    const ifProcess = req.body.ifProcess
    const services = req.body.services
    var today
    if (req.body.processDate) {
      today = new Date(req.body.date+ ' 10:00')
    }else{
      const dateformat = new Date(req.body.date)
      const dateDailyToday = dateformat.getFullYear() +"-"+(dateformat.getMonth() + 1)+"-"+dateformat.getDate()
      today = new Date(dateDailyToday+ ' 10:00')
    }
    var discount = 100 - req.body.discount
    var comisionTotal = 0
    for (let index = 0; index < services.length; index++) {
      let comisionPerAmount = 0
      let commissionDiscount = 0
      if (services[index].discount) {
          commissionDiscount = parseFloat(services[index].price)
      }else{ 
        if (discount == 100) {
          commissionDiscount = parseFloat(services[index].price)
        }else{
          commissionDiscount = parseFloat(services[index].price) * parseFloat('0.'+discount)
        }
      }
      comisionPerAmount = commissionDiscount * parseFloat('0.'+services[index].commission)
      comisionTotal = comisionTotal + comisionPerAmount
    }
  
    const total = req.body.total
    const totalComisionDesign = parseFloat(req.body.design) * 0.50
    const commission = parseFloat(comisionTotal) + parseFloat(totalComisionDesign)
    const totalGain = total - parseFloat(commission) 

    var discount
    if (discount == 100) {
      discount = '0'
    }else{
      discount = req.body.discount
    }
    const sale = {
        branch: req.body.branch,
        services: req.body.services,
        employe: req.body.employe,
        client: req.body.client,
        payType: req.body.payType,
        commission: parseFloat(commission),
        localGain: parseFloat(totalGain),
        typesPay: req.body.typesPay,
        purchaseOrder: req.body.purchaseOrder,
        discount: req.body.discount,
        design: req.body.design,
        count: 0,
        status: true,
        total: total,
        createdAt: today,
    }
    console.log(sale)
    const daySale = {
        branch: req.body.branch,
        services: req.body.services,
        employe: req.body.employe,
        commission: parseFloat(commission),
        typesPay: req.body.typesPay,
        purcharseOrder: req.body.purcharseOrder,
        discount: req.body.discount,
        design: req.body.design,
        total: total,
        idTableSales: '',
        createdAt: today
    }

    CashFund.find({branch: req.body.branch})
    .then(have => {
      console.log(have)
      if (have.length > 0) {
        if (have[0].validator) {
          Sale.find({branch: req.body.branch})
          .then(ifCount => {
            if (ifCount.length > 0) {
              Sale.find({branch: req.body.branch}).sort({count: -1}).limit(1)
              .then(Count => {
                sale.count = parseFloat(Count[0].count) + 1
                Sale.create(sale)
                .then(sales => {
                  console.log(sales)
                  daySale.idTableSales = sales._id
                  Employe.findByIdAndUpdate(req.body.employe.id,{
                    $inc: {commission: sales.commission}
                  })
                  .then(commission => {
                    Client.updateOne({email: req.body.client.email},{
                      $inc: {attends: 1},
                      $set: {lastAttend: today},
                      $push: {historical: daySale}
                    })
                    .then(lastDate => {
                      DaySale.create(daySale)
                      .then(sale => {
                        if (ifProcess != '') {
                          Dates.findByIdAndUpdate(ifProcess, {
                            $set: {
                              process: false
                            }
                          })
                          .then(process => {
                            Client.findOne({email: req.body.client.email})
                            .then(reco => { 
                              if (req.body.discount == 10) {
                                if (reco.idRecommender && reco.idRecommender != '') {
                                  Client.findByIdAndUpdate(reco.idRecommender, {
                                    $inc : {recommendations: 1}
                                  })
                                  .then(inc =>{
                                    Client.updateOne({email: req.body.client.email}, {
                                      $set : {idRecommender: ''}
                                    })
                                    .then(set =>{
                                      res.json({status: 'Sale register', token: req.requestToken})
                                    })
                                  })
                                }
                                else{
                                  res.json({status: 'Sale register', token: req.requestToken})
                                }
                              }else{
                                res.json({status: 'Sale register', token: req.requestToken})
                              }
                            })
                          })
                          .catch(err => {
                            res.send(err)
                          })
                        }else{
                          Client.findOne({email: req.body.client.email})
                            .then(reco => {
                              if (req.body.discount == 10) {
                                if (reco.idRecommender && reco.idRecommender != '') {
                                  Cliente.findByIdAndUpdate(reco.idRecommender, {
                                    $inc : {recommendations:1}
                                  })
                                  .then(inc =>{
                                    Cliente.updateOne({email: req.body.client.email}, {
                                      $set : {idRecommender:''}
                                    })
                                    .then(set =>{
                                      res.json({status: 'Sale register', token: req.requestToken})
                                    })
                                  })
                                }
                                else{
                                  res.json({status: 'Sale register', token: req.requestToken})
                                }
                              }else{
                                res.json({status: 'Sale register', token: req.requestToken})
                              }
                            })
                        }
                      })
                      .catch(err => {
                        res.send(err)
                      })
                    })
                    .catch(err => {
                      res.send(err)
                    })
                  })
                  .catch(err => {
                    res.send(err)
                  })
                })
                .catch(err => {
                  res.send(err)
                })
              })
            }else{
              sale.count = 1
              Sale.create(sale)
              .then(sales => {
                console.log(sales)
                daySale.idTableSales = sales._id
                Employe.findByIdAndUpdate(req.body.employe.id,{
                  $inc: {commission: sales.commission}
                })
                .then(comision => {
                  Client.updateOne({email: req.body.client.email},{
                      $inc: {attends: 1},
                      $set: {lastAttend: today},
                      $push: {historical: daySale}
                  })
                  .then(lasDate => {
                    DaySale.create(daySale)
                    .then(venta => {
                      if (ifProcess != '') {
                        Dates.findByIdAndUpdate(ifProcess, {
                          $set: {
                            process: false
                          }
                        })
                        .then(process => {
                          res.json({status: 'Sale register', token: req.requestToken})
                        })
                        .catch(err => {
                          res.send(err)
                        })
                      }else{
                        res.json({status: 'Sale register', token: req.requestToken})
                      }
                    })
                    .catch(err => {
                      res.send(err)
                    })
                  })
                  .catch(err => {
                    res.send(err)
                  })
                })
                .catch(err => {
                  res.send(err)
                })
              })
              .catch(err => {
                res.send(err)
              })
            }
          })
        }else{
          res.json({status: 'no-cash'})
        }
      }else{
        CashFund.create({
            branch: req.body.branch,
            userRegister: '',
            amount: 0,
            amountEgress: 0,
            quantity: 0,
            validator: true
        }).then(createCash => {
          res.json({status: 'no-cash'})
        })
      }
    })
})

// input - form with total, branch, userRegister, amount
// ouput - status and token
sales.post('/registerFund', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const CashFund = conn.model('cashfunds', cashfundSchema)

    const find = await CashFund.find({branch: req.body.branch})
    if (find.length > 0) {
      const register = await CashFund.findByIdAndUpdate(find[0]._id, {
        $set: {
            userRegister: req.body.userRegister,
            amount: req.body.amount,
            amountEgress: 0,
            validator: true
        }
      })
      if (register) {
        res.status(200).json({status: 'ok', token: req.requestToken})
      }
      res.json({status: 'bad'})
    }else{
      const createData = await CashFund.create({
          branch: req.body.branch,
          userRegister: req.body.userRegister,
          amount: req.body.amount,
          amountEgress: 0,
          quantity: 0,
          validator: true
      })
      res.json({status: 'ok'})
    }
})

// input - params id, form with employeComision
// ouput - status and token
sales.put('/:id', protectRoute, async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const DaySale = conn.model('daySales', daySaleSchema)
    const Sale = conn.model('sales', saleSchema)
    const Employe = conn.model('employes', employeSchema)

    const id = req.params.id
    const dataComision = '-'+req.body.commission
    try {
      const cancelSale = await Sale.findByIdAndUpdate(id, {
        $set: { status: false}
      })
      if (cancelSale) {
        try {
          const removeSale = await DaySale.findOneAndRemove({idTableSales: id})
          try {
            const removeComision = await Employe.findByIdAndUpdate(req.body.employeId, {
              $inc: {
                commission: parseFloat(dataComision)
              }
            })
            res.json({status: 'ok', token: req.requestToken})
          }catch(err){res.send(err)}
          
          res.status(200).json({status: 'ok', token: req.requestToken})
        }catch(err){res.send(err)}
      }
      res.json({status: 'bad'})
    }catch(err){res.send(err)}
})

// input - params id, form with manual
// ouput - status and token
sales.put('/editclosedmanualamounts/:id', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Closure = conn.model('closures', closureSchema)

    const data = req.body.manual
    try {
        const editClosure = await Closure.findByIdAndUpdate(req.params.id, {
            $set:{
                manual: data
            }
        })
        res.json({status: 'ok', token: req.requestToken})
    }catch(err){
        res.send(err)
    }
})

module.exports = sales