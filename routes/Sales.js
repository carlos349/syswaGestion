const express = require('express')
const sales = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const saleSchema = require('../models/Sales')
const closureSchema = require('../models/Closures')
const cashfundSchema = require('../models/CashFunds')
const daySaleSchema = require('../models/DaySales')
const endingDateSchema = require('../models/EndingDates')
const employeSchema = require('../models/Employes')
const clientSchema = require('../models/Clients')
const inventorySchema = require('../models/Inventory')
const dateSchema = require('../models/Dates')
const configurationSchema = require('../models/Configurations')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
const formats = require('../formats')
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

//input - branch
//output - status, data and token
sales.get('/totalSales/:branch', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })
  const Sale = conn.model('sales', saleSchema)
  const dateDaily = new Date()
  const sinceActual = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() + 1)+"-1 00:00"
  const untilActual = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() + 1)+"-31 24:00"

  try {
    const salesThisMonth = await Sale.find({
      $and: [
          {createdAt: { $gte: sinceActual, $lte: untilActual }},
          {branch: req.params.branch},
          {status:true}
      ]
    })
    var totalSales = 0
    for (const sale of salesThisMonth) {
      totalSales = totalSales + sale.totals.total
    }
    res.json({status: 'ok', data: totalSales, token: req.requestToken})
  }catch(err){res.send(err)}
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

// input - params id, pasar id
//  output - status, data and token
sales.get('/getSale/:id', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];
  const conn = mongoose.createConnection('mongodb://localhost/'+database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })
  const Sale = conn.model('sales', saleSchema)
  console.log(req.params.id)
  try{ 
      const findSale = await Sale.findById(req.params.id)
      console.log(findSale)
      if (findSale) {
          res.json({status: 'ok', data: findSale, token: req.requestToken})
      }else{
          res.json({status: 'sale does exist', token: req.requestToken})
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

  try {
      const Sales = await Sale.find({
        $and: [
          {createdAt: { $gte: req.body.dates[0]+' 00:00', $lte: req.body.dates[1]+' 24:00' }},
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
      clientSelect: req.body.clientSelect
    }
    console.log(data)
    var dataTable = []
    if (data.clientSelect.length == 0) {
        try {
            const sales = await Sale.find({
                $and: [
                  {createdAt: {$gte: data.rangeExcel[0]+' 00:00', $lte: data.rangeExcel[1]+' 24:00'}},
                  {status:true},
                  {branch: req.body.branch}
                ]
            })
            if(sales.length > 0){
              try {

              }catch(err){
                console.log(err)
              }
              for (let index = 0; index < sales.length; index++) {
                const element = sales[index];

                var typesPay = ''
                for (let e = 0; e < element.typesPay.length; e++) {
                    const elementTwo = element.typesPay[e];
                    if (elementTwo.total > 0) {
                      typesPay = typesPay + elementTwo.type + ': ' + elementTwo.total + ' '
                    }
                }
                for (const items of element.items) {
                  var additionals = ''
                  var totalAddi = 0
                  for (const addi of items.additionals) {
                    additionals = additionals == '' ? addi.name : + ', ' + addi.name
                    totalAddi = totalAddi + addi.price
                  }
                  if (items.type == 'service') {
                    dataTable.push({Fecha: formats.dates(element.createdAt), ID: 'V-'+element.count, Cliente: element.client.firstName+' '+element.client.lastName, Producto: '', Servicio: items.item.name, Precio: items.item.price, Adicionales: additionals == '' ? 'Sin adicional' : additionals, 'Total Adicionales': totalAddi,  'Tipo de pago': typesPay, Total: items.totalItem})
                  }else{
                    dataTable.push({Fecha: formats.dates(element.createdAt), ID: 'V-'+element.count, Cliente: element.client.firstName+' '+element.client.lastName, Producto: items.item.name+', Cantidad: '+items.quantityProduct, Servicio: '', Precio: items.item.price, Adicionales: 'Sin adicional', 'Total Adicionales': 'Sin adicional',  'Tipo de pago': typesPay, Total: items.totalItem})
                  }
                  
                }
              }
              console.log(dataTable)
              res.json({status: 'ok', dataTable: dataTable, token: req.requestToken})
            }else{
              res.json({status: 'bad'})
            }
        }catch(err){
            res.send(err)
        }
    }else{
      try {
        const sales = await Sale.find({
            $and: [
                {createdAt: {$gte: data.rangeExcel[0]+' 00:00', $lte: data.rangeExcel[1]+' 24:00'}},
                {'client.email': data.clientSelect },
                {status:true},
                {branch: req.body.branch}
            ]
        })
        if(sales.length > 0){
          for (let index = 0; index < sales.length; index++) {
            const element = sales[index];

            var typesPay = ''
            for (let e = 0; e < element.typesPay.length; e++) {
                const elementTwo = element.typesPay[e];
                if (elementTwo.total > 0) {
                  typesPay = typesPay + elementTwo.type + ': ' + elementTwo.total + ' '
                }
            }
            for (const items of element.items) {
              var additionals = ''
              var totalAddi = 0
              for (const addi of items.additionals) {
                additionals = additionals == '' ? addi.name : + ', ' + addi.name
                totalAddi = totalAddi + addi.price
              }
              if (items.type == 'service') {
                dataTable.push({Fecha: formats.dates(element.createdAt), ID: 'V-'+element.count, Cliente: element.client.firstName+' '+element.client.lastName, Producto: '', Servicio: items.item.name, Precio: items.item.price, Adicionales: additionals == '' ? 'Sin adicional' : additionals, 'Total Adicionales': totalAddi,  'Tipo de pago': typesPay, Total: items.totalItem})
              }else{
                dataTable.push({Fecha: formats.dates(element.createdAt), ID: 'V-'+element.count, Cliente: element.client.firstName+' '+element.client.lastName, Producto: items.item.name+', Cantidad: '+items.quantityProduct, Servicio: '', Precio: items.item.price, Adicionales: 'Sin adicional', 'Total Adicionales': 'Sin adicional',  'Tipo de pago': typesPay, Total: items.totalItem})
              }
              
            }
          }
          console.log(dataTable)
          res.json({status: 'ok', dataTable: dataTable, token: req.requestToken})
        }else{
          res.json({status: 'bad'})
        }
      }catch(err){
          res.send(err)
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
  const EndingDates = conn.model('endingdates', endingDateSchema)
  const Client = conn.model('clients', clientSchema)
  const Employe = conn.model('employes', employeSchema)
  const Dates = conn.model('dates', dateSchema)
  const Inventory = conn.model('inventories', inventorySchema)

  const items = req.body.items
  const total = req.body.total
  const totalPay = req.body.totalPay
  const typesPay = req.body.typesPay
  const client = req.body.client
  const clientId = req.body.clientId
  const restPay = req.body.restPay
  
  const dataSale = {
    branch: req.body.branch,
    items: [],
    client: client,
    localGain: 0,
    typesPay: typesPay,
    purchaseOrder: 0,
    count: 0,
    status: true,
    totals: {
      total: total,
      totalPay: totalPay
    },
    uuid: new Date().getTime(),
    createdAt: req.body.date
  }

  const daySale = {
    branch: req.body.branch,
    items: items,
    typesPay: typesPay,
    total: total,
    idTableSales: '',
    createdAt: req.body.date
  }
  
  for (const item of items) {
    dataSale.localGain = dataSale.localGain + item.totalLocal
    item.employe.commission = item.tag == 'service' ? item.commissionEmploye : ''
    item.employe = item.tag == 'service' ? item.employe : 'none'
    dataSale.items.push({
      item: item.item,
      price: item.price,
      discount: item.discount,
      additionals: item.additionals,
      additionalsTotal: item.additionalTotal,
      quantityProduct: item.quantityProduct,
      totalItem: item.total,
      employe: item.employe,
      type: item.tag
    })
  }
  
  CashFund.findOne({branch: req.body.branch})
  .then(cashFund => {
    if (cashFund) {
      if (cashFund.validator) {
        if (restPay > 0) {
          CashFund.findByIdAndUpdate(cashFund._id, {
            $inc: {
              amount: parseFloat('-'+restPay),
              amountEgress: parseFloat(restPay)
            }
          }).then(readyCash => {})
        }
        Sale.find({branch: req.body.branch}).sort({count: -1}).limit(1)
        .then(findSale => {
          dataSale.count = findSale[0] ? findSale[0].count + 1 : 1
          Sale.create(dataSale)
          .then(createSale => {
            daySale.idTableSales = createSale._id
            Client.findByIdAndUpdate(clientId, {
              $inc: {attends: 1},
              $set: {lastAttend: req.body.date},
              $push: {historical: dataSale}
            })
            .then(editClient => {
              DaySale.create(daySale)
              .then(createDaySale => {
                for (let index = 0; index < items.length; index++) {
                  const item = items[index];
                  if (item.tag == 'product') {
                    Inventory.findByIdAndUpdate(item.item._id,{
                      $inc: {
                        consume: parseInt(item.quantityProduct)
                      }
                    }).then(editInventory => {})
                  }else{
                    if (item.datesItem) {
                      EndingDates.findByIdAndRemove(item.datesItem._id)
                      .then(delteDate => {})
                    }
                    Employe.findByIdAndUpdate(item.employe.id, {
                      $inc: {
                        commission: item.commissionEmploye
                      }
                    }).then(editEmploye => {})
                    for (const product of item.item.products) {
                      Inventory.findByIdAndUpdate(product.id,{
                        $inc: {
                          consume: parseInt(product.count)
                        }
                      }).then(editInventory => {})
                    }
                  }
                }
                res.json({status: 'ok', token: req.requestToken})
              }).catch(err => res.send(err))
            }).catch(err => res.send(err))
          }).catch(err => res.send(err))
        }).catch(err => res.send(err))
      }else{
        res.json({status: 'no-cash'})
      }
    }else{
      res.json({status: 'no-cash'})
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

    try {
      const find = await CashFund.findOne({branch: req.body.branch})
      console.log(find)
      if (find) {
        try {
          const register = await CashFund.findByIdAndUpdate(find._id, {
            $set: {
              userRegister: req.body.userRegister,
              amount: req.body.amount,
              amountEgress: 0,
              validator: true
            }
          })
          if (register) {
            res.status(200).json({status: 'ok', token: req.requestToken})
          }else{
            res.json({status: 'bad'})
          }
        }catch(err){res.send(err)}
      }else{
        try {
          const createData = await CashFund.create({
            branch: req.body.branch,
            userRegister: req.body.userRegister,
            amount: req.body.amount,
            amountEgress: 0,
            quantity: 0,
            validator: true
          })
          if (createData) {
            res.json({status: 'ok'})
          }
        }catch(err){res.send(err)}
      }
    }catch(err){res.send(err)}
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
    const Inventory = conn.model('inventories', inventorySchema)
    const id = req.params.id
    
    try {
      const cancelSale = await Sale.findByIdAndUpdate(id, {
        $set: { status: false}
      })
      if (cancelSale) {
        console.log(cancelSale)
        const items = cancelSale.items
        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          if (item.type == 'product') {
            Inventory.findByIdAndUpdate(item.item._id,{
              $inc: {
                consume: parseFloat('-'+item.quantityProduct)
              }
            }).then(editInventory => {})
          }else{
            Employe.findByIdAndUpdate(item.employe.id, {
              $inc: {
                commission: parseFloat('-'+item.employe.commission)  
              }
            }).then(editEmploye => {})
            for (const product of item.item.products) {
              Inventory.findByIdAndUpdate(product.id,{
                $inc: {
                  consume: parseFloat('-'+product.count)
                }
              }).then(editInventory => {})
            }
          }
        }
        try {
          const removeSale = await DaySale.findOneAndRemove({idTableSales: id})
          res.json({status: 'ok', token: req.requestToken})
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