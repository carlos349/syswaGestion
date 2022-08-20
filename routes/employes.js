const express = require('express')
const employes = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const employeSchema = require('../models/Employes')
const userSchema = require('../models/Users')
const datesBlockSchema = require('../models/datesBlocks')
const serviceSchema = require('../models/Services')
const daySaleSchema = require('../models/DaySales')
const expenseSchema = require('../models/Expenses')
const LogService = require('../logService/logService')
const historyEmployeSchema = require('../models/HistoryEmployeClosed')
const saleSchema = require('../models/Sales')
const cors = require('cors')
const { QLDB } = require('aws-sdk')
const connect = require('../mongoConnection/conectionInstances')
const logger = require('../Logs/serviceExport');
const logDates = logger.getLogger("dates");
employes.use(cors())

// Api que busca todos los empleados. (Ingreso: nulo) -- Api that search all the users. (input: Null)

employes.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Employe = connect.useDb(database).model('employes', employeSchema)
    try{
        const getEmployes = await Employe.find()
        if (getEmployes.length > 0) {
            res.json({status: 'ok', data: getEmployes, token: req.requestToken})
        }else{
            res.json({status:'There is not employes'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})


employes.get('/UsersEmployes/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Employe = connect.useDb(database).model('employes', employeSchema)
    const User = connect.useDb(database).model('users', userSchema)

    try{
        const getEmployes = await Employe.find({branch: req.params.branch})
        if (getEmployes.length > 0) {
            try {
                const users = await User.populate(getEmployes, {path: "users"})
                const sendData =  []
                for (const employe of users) {
                    if (employe.users) {
                        sendData.push({name: employe.firstName + ' '+ employe.lastName, img: employe.users.userImage != '' ? employe.users.userImage : 'no', days: employe.days, class: employe.class, _id: employe._id, document: employe.document})
                    }else{
                        sendData.push({name: employe.firstName + ' '+ employe.lastName, img: 'no', days: employe.days, class: employe.class, _id: employe._id, document: employe.document})
                    }
                }
                res.json({status: 'ok', data: sendData, token: req.requestToken})
            }catch(err){
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                Log.createLog()
                .then(dataLog => {
                    res.send('failed api with error, '+ dataLog.error)
                })
            }
        }else{
            res.json({status:'There is not employes'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

employes.get('/historyCloses/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const HistoryEmploye = connect.useDb(database).model('historyEmploye', historyEmployeSchema)

    try {
        const getHistory = await HistoryEmploye.find({
            "employe.id": req.params.id
        })
        if (getHistory.length > 0) {
            res.json({status: 'ok', data: getHistory})  
        }else{
            res.json({status: 'bad'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

employes.get('/getHistoryEmploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const HistoryEmploye = connect.useDb(database).model('historyEmploye', historyEmployeSchema)

    try {
        const getHistory = await HistoryEmploye.findById(req.params.id)
        if (getHistory) {
            res.json({status: 'ok', data: getHistory})  
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

// Fin de la api. (Retorna datos de los empeados) -- Api end (output employes' data)

//----------------------------------------------------------------------------------

// Api que busca un solo empleado por id. (Ingreso: ObjectId) -- Api that search one an by id. (Input: ObjectId)

employes.get('/justonebyid/:id', protectRoute, async (req, res) =>{
    const database = req.headers['x-database-connect'];
    

    const Employe = connect.useDb(database).model('employes', employeSchema)
    try{
        const findById = await Employe.findById(req.params.id)
        if (findById) {
            res.json({status: 'ok', data: findById, token: req.requestToken})
        }else{
            res.json({status: 'employe not found'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }

})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//----------------------------------------------------------------------------------

// Api que busca empleados por branch. (Ingreso:Branch´s ObjectId) -- Api that search employes by branch. (Input: Branch´s ObjectId)

employes.get('/employesbybranch/:branch', protectRoute, async (req, res) =>{
    const database = req.headers['x-database-connect'];
    

    const Employe = connect.useDb(database).model('employes', employeSchema)
    const User = connect.useDb(database).model('users', userSchema)

    try{
        const findByBranch = await Employe.find({branch: req.params.branch})
        if (findByBranch) {
            try {
                const users = await User.populate(findByBranch, {path: "users"})
                for (const user of users) {
                    if (user.users) {
                        user.users.password = 'password removed for security'
                    }
                }
                res.json({status: 'ok', data: users, token: req.requestToken})
            }catch(err){
                res.send(err)
            }
        }else{
            res.json({status: 'employes not found'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }

})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//----------------------------------------------------------------------------------

// Api que busca empleados por branch. (Ingreso:Branch´s ObjectId) -- Api that search employes by branch. (Input: Branch´s ObjectId)

employes.get('/employesbybranchForClients/:branch', async (req, res) =>{
    const database = req.headers['x-database-connect'];
    

    const Employe = connect.useDb(database).model('employes', employeSchema)
    try{
        const findByBranch = await Employe.find({branch:req.params.branch})
        if (findByBranch) {
            res.json({status: 'ok', data: findByBranch, token: req.requestToken})
        }else{
            res.json({status: 'employes not found'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            '', 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }

})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//----------------------------------------------------------------------------------

// Api que busca las ventas de un empleado específico por su id. (Ingreso: ObjectId) -- Api that search the especific sales from an employe by id. (Input: ObjectId)

employes.get('/salesbyemploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const DaySale = connect.useDb(database).model('daySales', daySaleSchema)
    const Sale = connect.useDb(database).model('sales', saleSchema)

    try{
        const findSales = await Sale.find({items: {$elemMatch:{"employe.id": req.params.id, "statusClose": true}}})
        if (findSales){
            let salesOfEmploye = []
            try{
                const dSales = await DaySale.find()
                if (dSales) {
                    for (let i = 0; i < findSales.length; i++) {
                        const element = findSales[i];
                        for (let e = 0; e < element.items.length; e++) {
                            const sale = element.items[e];
                            if (sale.employe.id == req.params.id && element.status && sale.statusClose) {
                                let valid = true
                                dSales.forEach(elem => {
                                    if (elem.idTableSales == element._id) {
                                        valid = false
                                    }
                                });
                                
                                salesOfEmploye.push({createdAt: element.createdAt, client: element.client.firstName + ' ' + element.client.lastName, commission: sale.employe.commission, total: sale.totalItem, service: sale.item.name,id: sale.id, saleData: element,validNull: valid})
                            }
                        }
                    }
                    res.json({status: 'ok', data: salesOfEmploye, token: req.requestToken})
                }

            }catch(err){
                console.log(err)
            }
            
        }else{
            res.json({status: 'sales not found'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

//Fin de la api. (Retorna ventas del empleado) -- Api end (output employe's sales)

//----------------------------------------------------------------------------------

// Api que anula una venta de un empleado específico por su id. (Ingreso: ObjectId)

employes.put('/nullsale/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Sale = connect.useDb(database).model('sales', saleSchema)
    const Employe = connect.useDb(database).model('employes', employeSchema)
    const DaySale = connect.useDb(database).model('daySales', daySaleSchema)
    try{
        const findSale = await Sale.findById(req.params.id)
        if (findSale){
            var commission = 0
            var total = 0
            for (let e = 0; e < findSale.items.length; e++) {
                const sale = findSale.items[e];
                if (sale.id == req.body.id) {
                    commission = sale.employe.commission
                    total = sale.totalItem
                    findSale.items.splice(e, 1)
                    if (findSale.items.length == 0) {
                        findSale.status = false
                    }
                }
            }
            commission = req.body.commission - commission
            findSale.typesPay[0].total = findSale.typesPay[0].total - parseFloat(total)
            Sale.findByIdAndUpdate(req.params.id, {
                $set: {
                    items: findSale.items, 
                    status: findSale.status,
                    'totals.total': findSale.totals.total - parseFloat(total),
                    'totals.totalPay': findSale.totals.totalPay - parseFloat(total),
                    typesPay: findSale.typesPay
                }
            }).then(update =>{
                Employe.findByIdAndUpdate(req.body.idEmploye, {
                    $set: {commission: commission}
                })
                .then(updateEmploye =>{
                    DaySale.findOne({idTableSales: req.params.id})
                    .then(DaySales => {
                        DaySales.total = DaySales.total - parseFloat(total)
                        DaySales.typesPay[0].total = DaySales.typesPay[0].total - parseFloat(total)
                        if(DaySales.total == 0){
                            DaySale.findByIdAndRemove(DaySales._id)
                            .then(deleteDaySale => {
                                res.json({status: 'ok', data: update, token: req.requestToken})
                            })
                            .catch(err => {
                                const Log = new LogService(
                                    req.headers.host, 
                                    req.body, 
                                    req.params, 
                                    err, 
                                    req.requestToken, 
                                    req.headers['x-database-connect'], 
                                    req.route
                                )
                                Log.createLog()
                                .then(dataLog => {
                                    res.send('failed api with error, '+ dataLog.error)
                                })
                            })
                        }else{
                            DaySale.findByIdAndUpdate(DaySales._id, {
                                $set: {
                                    total: DaySales.total,
                                    typesPay: DaySales.typesPay
                                }
                            })
                            .then(updateDaySale => {
                                res.json({status: 'ok', data: update, token: req.requestToken})
                            })
                            .catch(err => {
                                const Log = new LogService(
                                    req.headers.host, 
                                    req.body, 
                                    req.params, 
                                    err, 
                                    req.requestToken, 
                                    req.headers['x-database-connect'], 
                                    req.route
                                )
                                Log.createLog()
                                .then(dataLog => {
                                    res.send('failed api with error, '+ dataLog.error)
                                })
                            })
                        }
                    })
                    .catch(err => {
                        const Log = new LogService(
                            req.headers.host, 
                            req.body, 
                            req.params, 
                            err, 
                            req.requestToken, 
                            req.headers['x-database-connect'], 
                            req.route
                        )
                        Log.createLog()
                        .then(dataLog => {
                            res.send('failed api with error, '+ dataLog.error)
                        })
                    })
                })
            })
        }else{
            res.json({status: 'sales not found'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

//Fin de la api. (Retorna ventas del empleado) -- Api end (output employe's sales)

//----------------------------------------------------------------------------------

//Api que registra un nuevo empleado. (Ingreso: branch, firstName, lastName, document, days) -- Api that create a new employe. (Input: branch, firstName, lastName, document, days)

employes.post('/', async (req, res) => {
    const database = req.headers['x-database-connect'];

    const Employe = connect.useDb(database).model('employes', employeSchema)
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)

    Employe.find({document:req.body.document})
    .then(findEmploye => {
        if (findEmploye.length > 0) {
            res.json({status: 'employe already exist'})
        }else{
            Employe.find()
            .then(findAll => {
                const today = new Date()
                const dataEmploye = {
                    branch: req.body.branch,
                    days: req.body.days,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    document: req.body.document,
                    validOnline: req.body.validOnline,
                    commission: 0,
                    advancement: 0,
                    bonus: 0,
                    class: ''
                }
                if (findAll) {
                    var count = findAll.length
                    dataEmploye.class = 'class' + count++
                }
                Employe.create(dataEmploye)
                .then(employeCreated => {
                    const employeForBlock = {
                        name: req.body.firstName + ' ' + req.body.lastName,
                        id: employeCreated._id,
                        class: employeCreated.class,
                        valid: false,
                        img: employeCreated.img 
                    }
                    for (let n = 0; n < req.body.days.length; n++) {
                        const element = req.body.days[n];
                            dateBlock.find({$and:[{"dateData.dateDay": element.day}, {"dateData.branch":req.body.branch}]})
                            .then(res => {
                                if (res.length > 0) {
                                    for (let e = 0; e < res.length; e++) {
                                        const blocks = res[e].blocks
                                        for (let w = 0; w < blocks.length; w++) {
                                                blocks[w].employes.push(employeForBlock)
                                        }
                                        for (let j = 0; j < blocks.length; j++) {
                                            if (blocks[j].hour == element.hours[0]) {
                                                for (let q = 0; q < 120; q++) {
                                                    if (blocks[j + q].hour == element.hours[1]) {
                                                        break
                                                    }
                                                    for (let indexB = 0; indexB < blocks[j + q].employes.length; indexB++) {
                                                        const elementB = blocks[j + q].employes[indexB];
                                                        
                                                        if (elementB.id == employeCreated._id) {
                                                            blocks[j + q].employes.splice(indexB, 1)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        dateBlock.findByIdAndUpdate(res[e]._id,{
                                            $set:{
                                                blocks:blocks
                                            }
                                        }).then(resEdit=>{}) 
                                    }
                                }
                            })
                    }
                    res.json({status: 'employe created', data: employeCreated})
                }).catch(err => {
                    const Log = new LogService(
                        req.headers.host, 
                        req.body, 
                        req.params, 
                        err, 
                        '', 
                        req.headers['x-database-connect'], 
                        req.route
                    )
                    Log.createLog()
                    .then(dataLog => {
                        res.send('failed api with error, '+ dataLog.error)
                    })
                })
            }).catch(err => {
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    '', 
                    req.headers['x-database-connect'], 
                    req.route
                )
                Log.createLog()
                .then(dataLog => {
                    res.send('failed api with error, '+ dataLog.error)
                })
            })
        }
    }).catch(err => {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            '', 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    })
    
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

//Api que registra un avance a un empleado específico. (Ingreso: branch, detail, ObjectId del empleado, firstName,document, avance o bono, amount) -- Api that register an avancement from an especific employe (Input: branch, detail, employe´s ObjectId, firstName, document, advancement or bonus, amount)

employes.post('/registerexpenseforemploye', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Employe = connect.useDb(database).model('employes', employeSchema)
    const Expense = connect.useDb(database).model('expenses', expenseSchema)

    const type = req.body.type ? 'Bonus' : 'Advancement'
    const advancement = {
        branch: req.body.branch,
        detail: req.body.detail,
        amount: req.body.amount,
        employe: {
            id: req.body.id,
            firstName: req.body.firstName,
            document: req.body.document,
        },
        type: type
    }

    Expense.create(advancement)
    .then(createdExpense => {
        if (req.body.type) {
            Employe.findByIdAndUpdate(req.body.id, { $inc: { bonus: req.body.amount }})
            .then(employeUpdated => {
                res.json({status:'bonus updated', data: createdExpense, token: req.requestToken})
            }).catch(err => {
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                Log.createLog()
                .then(dataLog => {
                    res.send('failed api with error, '+ dataLog.error)
                })
            })
        }else{
            Employe.findByIdAndUpdate(req.body.id, { $inc: { advancement: req.body.amount }})
            .then(employeUpdated => {
                res.json({status:'advancement updated', data: createdExpense, token: req.requestToken})
            }).catch(err => {
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                Log.createLog()
                .then(dataLog => {
                    res.send('failed api with error, '+ dataLog.error)
                })
            })
        }
    }).catch(err => {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    })
})

//Fin de la api. -- Api end.

//------------------------------------------------------------------------------------

//Api que elimina un empleado. (Ingreso: ObjectId del empleado) -- Api that delete an employe (Input: employe´s ObejctId)

employes.delete('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];

    const Employe = connect.useDb(database).model('employes', employeSchema)
    const Service = connect.useDb(database).model('services', serviceSchema)
    try{
        const deleteEmploye = await Employe.findByIdAndRemove(req.params.id)
        if (deleteEmploye) {
            try{
                const updateService = await Service.updateMany({employes: {$elemMatch:{id:req.params.id}}},{$pull:{employes:{id:req.params.id}}})
                if (updateService) {
                    res.json({status: 'employe deleted', data:deleteEmploye, token: req.requestToken })
                }
            }catch(err){
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                Log.createLog()
                .then(dataLog => {
                    res.send('failed api with error, '+ dataLog.error)
                })
            }
            
            
        }else{
            res.json({status: 'employe not found'})
        }
    }catch(err){
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

//Fin de la api -- Api end.

//--------------------------------------------------------------------------------------------------------------

//Api que edita a un empleado. (Ingreso: ObjectId de el empleado, days, firstName, lastName, document ) -- Api that edit an employe. (Input: Employes´s ObjectId, days, firstName, lastName, document)

employes.put('/', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];

    const Employe = connect.useDb(database).model('employes', employeSchema)
    const Service = connect.useDb(database).model('services', serviceSchema)
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)

    const dayValid = req.body.dayValid
    const validBloked = req.body.validBlocked
    var normalDays = []

    Employe.findById(req.body.id)
    .then(found => {
        Employe.find({document:req.body.document})
        .then(employeFind => {
            const originalDays = found.days
            if (validBloked) {
                normalDays = found.days
            }else{
                normalDays = req.body.days
            }
            if (found.document != req.body.document && employeFind.length > 0) {
                res.json({status: 'document already in use'})
            }else{
                Employe.findByIdAndUpdate(req.body.id, {
                    $set: {
                        days: normalDays,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        document: req.body.document,
                        validOnline: req.body.validOnline
                    }
                })
                .then(employeEdited => {
                    const employeForBlock = {
                        name: req.body.firstName + ' ' + req.body.lastName,
                        id: req.body.id,
                        class: employeEdited.class,
                        valid: false,
                        img: employeEdited.img 
                    }
                    var yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                        for (let days = 0; days <= 7; days++) {
                            var validDay = true
                            for (let n = 0; n < normalDays.length; n++) {
                                const element = normalDays[n];
                                
                                if (element.day == days) {
                                    dateBlock.find({$and:[{"dateData.dateDay": element.day}, {"dateData.branch":req.body.branch}, {"dateData.dateFormat": {$gt: yesterday}}]})
                                    .then(dateBlockFind => {
                                        if (dateBlockFind.length > 0) {
                                            for (let e = 0; e < dateBlockFind.length; e++) {
                                                const blocks = dateBlockFind[e].blocks
                                                for (let w = 0; w < blocks.length; w++) {
                                                    let validEmployeDay = true
                                                    let val2 = true
                                                    blocks[w].employes.forEach(elementE => {
                                                        if (elementE.id == employeForBlock.id) {
                                                            validEmployeDay = false
                                                        }
                                                    });
                                                    if (blocks[w].employeBlocked) {
                                                        blocks[w].employeBlocked.forEach(elementB => {
                                                            if (elementB.employe == employeForBlock.id) {
                                                                val2 = false
                                                            }
                                                        });
                                                    }
                                                    
                                                    if (validEmployeDay && val2) {
                                                        blocks[w].employes.push(employeForBlock)
                                                    }
                                                }
                                                dateBlock.findByIdAndUpdate(dateBlockFind[e]._id,{
                                                    $set:{
                                                        blocks:blocks
                                                    }
                                                }).then(resEdit=>{}) 
                                            }
                                        }
                                    })
                                    validDay = false
                                }
                            }
                            if (validDay) {
                                dateBlock.find({$and:[{"dateData.dateDay": days}, {"dateData.branch":req.body.branch}, {"dateData.dateFormat": {$gt: yesterday}}]})
                                .then(blockFindValid => {
                                    if (blockFindValid.length > 0) {
                                        for (let e = 0; e < blockFindValid.length; e++) {
                                            const blocks = blockFindValid[e].blocks
                                            for (let w = 0; w < blocks.length; w++) {
                                                blocks[w].employes.forEach((element, index) => {
                                                    if (element.id == employeForBlock.id) {
                                                        blocks[w].employes.splice(index,1)
                                                    }
                                                });
                                            }
                                            dateBlock.findByIdAndUpdate(blockFindValid[e]._id,{
                                                $set:{
                                                    blocks:blocks
                                                }
                                            }).then(resEdit=>{}) 
                                        }
                                    }
                                })
                            }
                        }

                        for (let days = 0; days <= 7; days++) {
                            var validDay = true
                            for (let n = 0; n < normalDays.length; n++) {
                                const element = normalDays[n];
                                
                                if (element.day == days) {
                                    dateBlock.find({$and:[{"dateData.dateDay": element.day}, {"dateData.branch":req.body.branch}, {"dateData.dateFormat": {$gt: yesterday}}]})
                                    .then(findBlockTwice => {
                                        if (findBlockTwice.length > 0) {
                                            for (let e = 0; e < findBlockTwice.length; e++) {
                                                const blocks = findBlockTwice[e].blocks
                                                for (let w = 0; w < blocks.length; w++) {
                                                    let validEmployeDay = true
                                                    let val3 = true
                                                    blocks[w].employes.forEach(elementE => {
                                                        if (elementE.id == employeForBlock.id) {
                                                            validEmployeDay = false
                                                        }
                                                    });
                                                    if (blocks[w].employeBlocked) {
                                                        blocks[w].employeBlocked.forEach(elementB => {
                                                            if (elementB.employe == employeForBlock.id) {
                                                                val3 = false
                                                            }
                                                        });
                                                    }
                                                    if (validEmployeDay && val3) {
                                                        blocks[w].employes.push(employeForBlock)
                                                    }
                                                }
                                                dateBlock.findByIdAndUpdate(findBlockTwice[e]._id,{
                                                    $set:{
                                                        blocks:blocks
                                                    }
                                                }).then(resEdit=>{}) 
                                            }
                                        }
                                    })
                                    validDay = false
                                }
                            }
                            if (validDay) {
                                dateBlock.find({$and:[{"dateData.dateDay": days}, {"dateData.branch":req.body.branch}, {"dateData.dateFormat": {$gt: yesterday}}]})
                                .then(ValidFindBlocksTwice => {
                                    if (ValidFindBlocksTwice.length > 0) {
                                        for (let e = 0; e < ValidFindBlocksTwice.length; e++) {
                                            const blocks = ValidFindBlocksTwice[e].blocks
                                            for (let w = 0; w < blocks.length; w++) {
                                                blocks[w].employes.forEach((element, index) => {
                                                    if (element.id == employeForBlock.id) {
                                                        blocks[w].employes.splice(index,1)
                                                    }
                                                });
                                            }
                                            dateBlock.findByIdAndUpdate(ValidFindBlocksTwice[e]._id,{
                                                $set:{
                                                    blocks:blocks
                                                }
                                            }).then(resEdit=>{}) 
                                        }
                                    }
                                })
                            }
                        }
                            let iO = null
                            setTimeout(() => {
                                for (let i = 0; i < normalDays.length; i++) {
                                    const element = normalDays[i]
                                    dateBlock.find({$and:[{"dateData.dateDay": element.day}, {"dateData.branch":req.body.branch}, {"dateData.dateFormat": {$gt: yesterday}}]})
                                    .then(normalFind => {
                                        
                                        for (let t = 0; t < originalDays.length; t++) {
                                            const elementO = originalDays[t];
                                            if (element.day == elementO.day) {
                                                iO = t
                                                break
                                            }
                                        }
                                        if (normalFind.length > 0) {
                                            for (let e = 0; e < normalFind.length; e++) {
                                                const blocks = normalFind[e].blocks
                                                for (let w = 0; w < blocks.length; w++) {
                                                    if (blocks[w].hour == originalDays[iO].hours[0]) {
                                                        
                                                        for (let q = 0; q < 120; q++) {
                                                            var validB = true
                                                            var valid4 = true
                                                            if (blocks[w + q].hour == originalDays[iO].hours[1]) {
                                                                break
                                                            }
                                                            blocks[w + q].employes.forEach(element => {
                                                                if (element.id == employeForBlock.id) {
                                                                    validB = false
                                                                }
                                                            });
                                                            if (blocks[w +q].employeBlocked) {
                                                                blocks[w +q].employeBlocked.forEach(elementB => {
                                                                    if (elementB.employe == employeForBlock.id) {
                                                                        valid4 = false
                                                                    }
                                                                });
                                                            }
                                                            if (validB && valid4) {
                                                                blocks[w + q].employes.push(employeForBlock)
                                                            }
                                                            
                                                            
                                                        }
                                                    }
                                                }
                                                for (let j = 0; j < blocks.length; j++) {
                                                    if (blocks[j].hour == element.hours[0]) {
                                                        for (let q = 0; q < 120; q++) {
                                                            if (blocks[j + q].hour == element.hours[1]) {
                                                                break
                                                            }
                                                            for (let indexB = 0; indexB < blocks[j + q].employes.length; indexB++) {
                                                                const elementB = blocks[j + q].employes[indexB];
                                                                
                                                                if (elementB.id == req.body.id) {
                                                                    blocks[j + q].employes.splice(indexB, 1)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                dateBlock.findByIdAndUpdate(normalFind[e]._id,{
                                                    $set:{
                                                        blocks:blocks
                                                    }
                                                }).then(resEdit=>{}) 
                                            }
                                        }
                                    })
                                }
                                
                            }, 1000);
                            
                            setTimeout(() => {
                                for (let i = 0; i < normalDays.length; i++) {
                                    const element = normalDays[i]
                                    dateBlock.find({$and:[{"dateData.dateDay": element.day}, {"dateData.branch":req.body.branch}, {"dateData.dateFormat": {$gt: yesterday}}]})
                                    .then(res => {
                                        
                                        for (let t = 0; t < originalDays.length; t++) {
                                            const elementO = originalDays[t];
                                            if (element.day == elementO.day) {
                                                iO = t
                                                break
                                            }
                                        }
                                        if (res.length > 0) {
                                            for (let e = 0; e < res.length; e++) {
                                                const blocks = res[e].blocks
                                                for (let w = 0; w < blocks.length; w++) {
                                                    if (blocks[w].hour == originalDays[iO].hours[0]) {
                                                        
                                                        for (let q = 0; q < 120; q++) {
                                                            var validB = true
                                                            var valid4 = true
                                                            if (blocks[w + q].hour == originalDays[iO].hours[1]) {
                                                                break
                                                            }
                                                            blocks[w + q].employes.forEach(element => {
                                                                if (element.id == employeForBlock.id) {
                                                                    validB = false
                                                                }
                                                            });
                                                            if (blocks[w +q].employeBlocked) {
                                                                blocks[w +q].employeBlocked.forEach(elementB => {
                                                                    if (elementB.employe == employeForBlock.id) {
                                                                        valid4 = false
                                                                    }
                                                                });
                                                            }
                                                            if (validB && valid4) {
                                                                blocks[w + q].employes.push(employeForBlock)
                                                            }
                                                            
                                                            
                                                        }
                                                    }
                                                }
                                                for (let j = 0; j < blocks.length; j++) {
                                                    if (blocks[j].hour == element.hours[0]) {
                                                        for (let q = 0; q < 120; q++) {
                                                            if (blocks[j + q].hour == element.hours[1]) {
                                                                break
                                                            }
                                                            for (let indexB = 0; indexB < blocks[j + q].employes.length; indexB++) {
                                                                const elementB = blocks[j + q].employes[indexB];
                                                                
                                                                if (elementB.id == req.body.id) {
                                                                    blocks[j + q].employes.splice(indexB, 1)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                dateBlock.findByIdAndUpdate(res[e]._id,{
                                                    $set:{
                                                        blocks:blocks
                                                    }
                                                }).then(resEdit=>{}) 
                                            }
                                        }
                                    })
                                }
                                
                            }, 2000);
                    Service.updateMany({employes: {$elemMatch:{"id":req.body.id}}},{$set:{"employes.$.days":normalDays}})
                    .then(finalEdit =>{
                        res.json({status: 'employe edited', data: employeEdited, token: req.requestToken})
                    }) 
                    .catch(err =>{
                        const Log = new LogService(
                            req.headers.host, 
                            req.body, 
                            req.params, 
                            err, 
                            req.requestToken, 
                            req.headers['x-database-connect'], 
                            req.route
                        )
                        Log.createLog()
                        .then(dataLog => {
                            res.send('failed api with error, '+ dataLog.error)
                        })
                    })  
                }).catch(err => {
                    const Log = new LogService(
                        req.headers.host, 
                        req.body, 
                        req.params, 
                        err, 
                        req.requestToken, 
                        req.headers['x-database-connect'], 
                        req.route
                    )
                    Log.createLog()
                    .then(dataLog => {
                        res.send('failed api with error, '+ dataLog.error)
                    })
                })
            }
        }).catch(err => {
            const Log = new LogService(
                req.headers.host, 
                req.body, 
                req.params, 
                err, 
                req.requestToken, 
                req.headers['x-database-connect'], 
                req.route
            )
            Log.createLog()
            .then(dataLog => {
                res.send('failed api with error, '+ dataLog.error)
            })
        })
    }).catch(err => {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    })
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

//Api que cierra a un empleado (Ingreso: ObjectId del empleado) -- Api that close an employe (Input: employe´s ObjectId)


employes.put('/registerBonus/:id', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    

    const Employe = connect.useDb(database).model('employes', employeSchema)

    Employe.findByIdAndUpdate(req.params.id, {
        $inc: {
            bonus: req.body.amount
        }
    })
    .then(editEmploye => {
        if (editEmploye) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }).catch(err => {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    })
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

//Api que cierra a un empleado (Ingreso: ObjectId del empleado) -- Api that close an employe (Input: employe´s ObjectId)


employes.put('/regAdvancement/:id', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    

    const Employe = connect.useDb(database).model('employes', employeSchema)

    Employe.findByIdAndUpdate(req.params.id, {
        $inc: {
            advancement: req.body.amount
        }
    })
    .then(editEmploye => {
        if (editEmploye) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }).catch(err => {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    })
    
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

//Api que cierra a un empleado (Ingreso: ObjectId del empleado) -- Api that close an employe (Input: employe´s ObjectId)

employes.put('/closeemploye/:id', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    
    
    const Employe = connect.useDb(database).model('employes', employeSchema)
    const Sale = connect.useDb(database).model('sales', saleSchema)
    const HistoryEmploye = connect.useDb(database).model('historyEmploye', historyEmployeSchema)
    const dataHistory = {
        sales: req.body.sales,
        bonus: req.body.bonus,
        advancement: req.body.advancement,
        commission: req.body.commission,
        employe: req.body.employe,
        createdAt: new Date()
    }
    HistoryEmploye.create(dataHistory)
    .then(createHistory => {
        for (let index = 0; index < 15; index++) {
            Sale.updateMany({items: {$elemMatch:{"employe.id":req.params.id, statusClose: true}}},{$set:{"items.$.statusClose":false}})
            .then(findSales => { })
        }
        Employe.findByIdAndUpdate(req.params.id, {
            $set: {
                commission:0,
                advancement:0,
                bonus:0
            }
        })
        .then(employeClosed => {
            res.json({status: 'employe closed', data: employeClosed, token: req.requestToken})
        })
        .catch(err => {
            const Log = new LogService(
                req.headers.host, 
                req.body, 
                req.params, 
                err, 
                req.requestToken, 
                req.headers['x-database-connect'], 
                req.route
            )
            Log.createLog()
            .then(dataLog => {
                res.send('failed api with error, '+ dataLog.error)
            })
        })
    })
    .catch(err => {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    })
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

module.exports = employes