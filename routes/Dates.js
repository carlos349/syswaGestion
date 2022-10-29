const express = require('express')
const dates = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const dateSchema = require('../models/Dates')
const dateBlockingSchema = require('../models/DateBlocking')
const employeSchema = require('../models/Employes')
const clientSchema = require('../models/Clients')
const endingDateSchema = require('../models/EndingDates')
const userSchema = require('../models/Users')
const datesBlockSchema = require('../models/datesBlocks')
const serviceSchema = require('../models/Services')
const LogService = require('../logService/logService')
const configurationSchema = require('../models/Configurations')
const uploadS3 = require('../common-midleware/index')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
const formats = require('../formats')
const logger = require('../Logs/serviceExport');
const logNode = logger.getLogger("node");
const logDates = logger.getLogger("dates");
//Ejemplo logs logDates.info(``);
const cors = require('cors')
const connect = require('../mongoConnection/conectionInstances')

dates.use(cors())

// Api que busca toda la informacion de las citas (Ingreso: Nullo) -- Api that search all the dates' data (Input: Null)

dates.get('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const date = connect.useDb(database).model('dates', dateSchema)
    const datesFormats = formats.datesMonth()
    try {
        const getDates = await date.find({
            $and: [
                {branch: req.params.branch},
                {createdAt: { $gte: datesFormats.thisMonth.since+' 00:00', $lte: '01-01-2050 24:00' }}
            ]
        })
        if (getDates.length > 0) {  
            res.json({ status: 'ok', data: getDates, token: req.requestToken })
        } else {
            res.json({ status: 'nothing to found', data: getDates, token: req.requestToken })
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

dates.get('/getNewDate/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)

    try {
        const newDate = await date.findById(req.params.id)
        if (newDate) { 
            res.json({ status: 'nothing to found', data: newDate, token: req.requestToken })
        } else {
            res.json({ status: 'nothing to found', token: req.requestToken })
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})
dates.get('/getDate/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const date = connect.useDb(database).model('dates', dateSchema)
    const Service = connect.useDb(database).model('services', serviceSchema)
    try {
        const getDates = await date.findById(req.params.id)
        if (getDates) { 
            const getService = await Service.findById(getDates.services[0].id)
            if (getService) {
                res.json({ status: 'ok', data: getDates, service: getService,  token: req.requestToken })  
            }else{
                res.json({ status: 'nothing to found', data: getDates, token: req.requestToken })
            }
        } else {
            res.json({ status: 'nothing to found', data: getDates, token: req.requestToken })
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

dates.get('/getDataDate/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)
    try {
        const getDates = await date.find({
            branch: req.params.branch
        }, {services: 0, microServices: 0, imgDesign: 0 }).sort({createdAt: 1})
        if (getDates.length > 0) {
            res.json(getDates)
        } 
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Fin de la api (Retorna: Datos de las citas) -- Api end (Return: dates´s data)

//----------------------------------------------------------------------------------

//Api que busca las citas de un prestador (Ingreso: ObjectId del empleado) -- Api that search dates by an employe (Input: Employe's ObjectId)

dates.get('/getDatesbyemploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)
    try {
        const find = await date.find({ 'employe.id': req.params.id })
        if (find.length > 0) {
            res.json({ status: 'ok', data: find, token: req.requestToken })
        } else {
            res.json({ status: 'nothing found', token: req.requestToken })
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Fin de la api (Retorna: Datos de las citas) -- Api end (Return: dates´s data)

//----------------------------------------------------------------------------------

//Api que busca las citas de un prestador (Ingreso: ObjectId del empleado) -- Api that search dates by an employe (Input: Employe's ObjectId)

dates.get('/getEndingDates/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const EndingDates = connect.useDb(database).model('endingdates', endingDateSchema)
    const dateT = formats.datesEdit(new Date())
    
    try {
        const find = await EndingDates.find({
            $and: [
                { createdAt: { $gte: dateT + ' 00:00' } },
                { branch: req.params.branch }
            ] 
        })
        if (find.length > 0) {
            res.json({ status: 'ok', data: find, token: req.requestToken })
        } else {
            res.json({ status: 'nothing found', token: req.requestToken })
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Fin de la api (Retorna: Datos de las horas bloqueadas) -- Api end (Return: hours blocking data)

//----------------------------------------------------------------------------------

//Api de la api (Retorna: Datos de las horas bloqueadas) llega (branch como parametro) -- Api end (Return: hours blocking data) input (branch as param)

dates.get('/getBlockingHours/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const HourBlocking = connect.useDb(database).model('hoursblocking', dateBlockingSchema)

    try {
        var month = new Date().getMonth()
        var year = new Date().getFullYear()
        const find = await HourBlocking.find({ 
            $and:[{
                dateBlockings:{
                    $gte: new Date(year, month, 1)
                },
                branch: req.params.branch 
            }]
        })
        if (find.length > 0) {
            res.json({ status: 'ok', data: find, token: req.requestToken })
        } else {
            res.json({ status: 'nothing found', token: req.requestToken })
        }
    } catch (err) {
        res.send(err)
    }
})


dates.get('/addData/:branch', (req, res) => {
    const database = req.headers['x-database-connect'];

    const HourBlocking = connect.useDb(database).model('hoursblocking', dateBlockingSchema)
    const datee = connect.useDb(database).model('dates', dateSchema)
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const Service = connect.useDb(database).model('services', serviceSchema)
    const Employe = connect.useDb(database).model('employes', employeSchema)
    
    for (const date of datesJson.blockingHours) {
        date.branch = "612f185da6a0df026bb599c5"
        HourBlocking.create(date).then(aja => {})
    }
    for (const date of datesJson.blocks) {
        date.dateData.branch = "612f185da6a0df026bb599c5"
        dateBlock.create(date).then(aja => {})
    }
    for (const date of datesJson.Dates) {
        date.branch = "612f185da6a0df026bb599c5"
        datee.create(date).then(aja => {})
    }
    for (const date of datesJson.Services) {
        date.branch = "612f185da6a0df026bb599c5"
        Service.create(date).then(aja => {})
    }
    for (const date of datesJson.Employes) {
        date.branch = "612f185da6a0df026bb599c5"
        Employe.create(date).then(aja => {})
    }

    res.json({status: 'ok'})
})

dates.get('/giveDatesToSendConfirm/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const datee = connect.useDb(database).model('dates', dateSchema)
    const dayBack = formats.dayBack(new Date())
    const dayBackEnd = formats.dayBack(new Date())
    try {
        const findDates = await datee.deleteMany({
            $and: [
                { createdAt: { $gte: dayBack+' 00:00', $lte: dayBackEnd+' 24:00' } },
                { branch: req.params.branch }
            ]
        })
        if (findDates) {
            res.json({ status: 'ok', token: req.requestToken })
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Fin de la api (Retorna: Datos de las horas bloqueadas) -- Api end (Return: hours blocking data)

//----------------------------------------------------------------------------------

//Api de la api (Retorna: Datos de las horas bloqueadas) llega (branch como parametro) -- Api end (Return: hours blocking data) input (branch as param)

dates.get('/deleteBlockingHours/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const HourBlocking = connect.useDb(database).model('hoursblocking', dateBlockingSchema)
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)
    const date = connect.useDb(database).model('dates', dateSchema)

    const dates = formats.dayToday(new Date())
    try {
        const find = await HourBlocking.deleteMany({
            $and: [
                { dateBlockings: { $lte: dates + ' 00:00' } },
                { branch: req.params.branch }
            ]
        })
        if (find) {
            const findDates = await date.deleteMany({
                $and: [
                    { createdAt: { $lte: dates + ' 00:00' } },
                    { branch: req.params.branch },
                    { isBlocked: true}
                ]
            })
            if(findDates){

                try {
                    const configBlock = await Configuration.findOne({branch: req.params.branch})
                    if(configBlock){
                        try {
                            
                            var today = new Date().getTime()
                            if(configBlock.blockedDays){
                                if(configBlock.blockedDays[0]){
                                    var len = configBlock.blockedDays.length
                                }else{
                                    var len = 0
                                }
                            }else{
                                var len = 0
                            }
                            
                            for (var i = 0; i < len; i++) {
                                for (var index = 0; index < configBlock.blockedDays.length; index++) {
                                    var blocked = configBlock.blockedDays[index]
                                    
                                    var bDate = new Date(blocked.dat).getTime()
                                    if(bDate < today){
                                        configBlock.blockedDays.splice(index, 1)
                                        break
                                    }
                                }
                             }
                            const deleteLast = await Configuration.findByIdAndUpdate(configBlock._id, {
                                blockedDays: configBlock.blockedDays
                            })
                            if (deleteLast) {
                                res.json({ status: 'ok', token: req.requestToken })
                            }
                        } catch (err) {
                            console.log(err)
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})
//Fin de la api (Retorna: Datos de las horas bloqueadas) -- Api end (Return: hours blocking data)

//----------------------------------------------------------------------------------

//Api de la api (Retorna: Datos de las horas bloqueadas) llega (branch como parametro) -- Api end (Return: hours blocking data) input (branch as param)

dates.get('/deleteEndingDates/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const EndingDates = connect.useDb(database).model('endingdates', endingDateSchema)
    const dates = formats.dayBack(new Date().setHours(new Date().getHours() - 4))
    try {
        const find = await EndingDates.deleteMany({
            $and: [
                { createdAt: { $gte: dates + ' 00:00', $lte: dates + ' 24:00' } },
                { branch: req.params.branch }
            ]
        })
        if (find) {
            res.json({ status: 'ok', token: req.requestToken })
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Fin de la api (Retorna: Datos de las citas del empleado) -- Api end (Return: Employe dates´s data)

//----------------------------------------------------------------------------------

//Api que busca las citas de un prestador (Ingreso: ObjectId del empleado) -- Api that search dates by an employe (Input: Employe's ObjectId)

dates.post('/availableslenders', (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)
    const Employe = connect.useDb(database).model('employes', employeSchema)
    const User = connect.useDb(database).model('users', userSchema)

    const dateNow = new Date(req.body.date)
    const day = dateNow.getDay()
    const formatdate = dateNow.getFullYear() + "-" + (dateNow.getMonth() + 1) + "-" + dateNow.getDate()
    dateNow.setDate(dateNow.getDate() + 1)
    const formatdateTwo = dateNow.getFullYear() + "-" + (dateNow.getMonth() + 1) + "-" + dateNow.getDate()
    var arrayLenders = []
    date.find({
        $and: [
            { createdAt: { $gte: formatdate, $lte: formatdateTwo } },
            { branch: req.body.branch }
        ]
    }).sort({ sort: 1 })
        .then(dates => {
            Employe.find({ branch: req.body.branch })
                .then(lenders => {
                    User.populate(lenders, { path: "users" })
                        .then(EmployeUserData => {
                            const Lenders = EmployeUserData
                            for (let index = 0; index < Lenders.length; index++) {
                                const element = Lenders[index];
                                var valid = false
                                var restTime = ''
                                for (let index = 0; index < element.days.length; index++) {
                                    const elementFour = element.days[index];
                                    if (elementFour.day == day) {
                                        valid = true
                                        restTime = elementFour.hours[0] + '/' + elementFour.hours[1]
                                    }
                                }
                                if (valid ) {
                                    var valid2 = true
                                    if (req.body.online && element.validOnline == false) {
                                        valid2 = false
                                    }
                                    if (valid2) {
                                        if (element.users) {
                                            arrayLenders.push({ name: element.firstName + ' ' + element.lastName, id: element._id, sort: 0, commission: element.commission, restTime: restTime, class: element.class, img: element.users.userImage != '' ? element.users.userImage : 'no',validOnline: element.validOnline })
                                        } else {
                                            arrayLenders.push({ name: element.firstName + ' ' + element.lastName, id: element._id, sort: 0, commission: element.commission, restTime: restTime, class: element.class, img: 'no',validOnline: element.validOnline })
                                        }
                                    }
                                }
                            }

                            if (dates.length > 0) {
                                for (let i = 0; i < dates.length; i++) {
                                    const elementTwo = dates[i];
                                    for (let j = 0; j < arrayLenders.length; j++) {
                                        const elementThree = arrayLenders[j];
                                        if (elementTwo.employe == elementThree.name) {
                                            elementThree.sort = elementTwo.sort
                                        }
                                    }
                                }
                                arrayLenders.sort((a, b) => {
                                    return a.commission - b.commission;
                                });
                                res.json({ array: arrayLenders, day: day })
                            } else {
                                arrayLenders.sort((a, b) => {
                                    return a.commission - b.commission;
                                });
                                res.json({ array: arrayLenders, day: day })
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
                .catch(err => {
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
})

//Fin de la api (Retorna: Datos de las citas del empleado) -- Api end (Return: Employe dates´s data)

//----------------------------------------------------------------------------------

//Api que crea una nueva cita (Ingreso: branch, start, end, date, sort, services, client:{id, name, email, phone, historical}, origin, employe:{id, name, document, class}, typePay) -- Api that register a new Date (Input: branch, start, end, date, sort, services:[], client:{id, name, email, phone, historical}, origin, employe:{id, name, document, class}, typePay)

dates.post('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)

    try {
        const inspector = await date.findOne({
            $and: [
                {
                    'client.id': req.body.client.id,
                    'employe.id': req.body.employe.id,
                    branch: req.body.branch,
                    start: req.body.start,
                    end: req.body.end
                }
            ]
        })
        if (inspector) {
            res.json({ status: 'date repeated' })
        } else {
            const dateData = {
                branch: req.body.branch,
                start: req.body.start,
                end: req.body.end,
                sort: req.body.sort,
                services: req.body.services,
                client: req.body.client,
                employe: req.body.employe,
                process: true,
                confirmation: false,
                confirmationId: new Date().getTime(),
                typePay: req.body.typePay,
                typeCreation: '',
                payPdf: '',
                imgDesign: [],
                origin: req.body.origin
            }
            const registerdate = await date.create(dateData)
            if (registerdate) {
                res.json({ status: 'date created', data: registerdate })
            }
        }
    } catch (err) {
        res.send(err)
    }
})

dates.post('/normalizeDatesBlocks', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const dataEmploye = {
        name: req.body.name,
        id: req.body.id,
        class: req.body.class,
        position: 0,
        valid: false,
        img: "no",
        commission: 0
    }
    
    try {
        const datesBlocks = await dateBlock.find()
        if(datesBlocks.length > 0){
            for (const datesB of datesBlocks) {
                for (const block of datesB.blocks) {
                    for (const key in block.employes) {
                        const employe = block.employes[key]
                        if (employe.id == dataEmploye.id) {
                            block.employes.splice(key, 1)
                        }
                        if (employe.name == null) {
                            block.employes.splice(key, 1)
                        }
                    }
                    var valid = true
                    for (const employeBlock of block.employeBlocked) {
                        if (employeBlock.employe == dataEmploye.id) {
                            valid = false
                        }
                    }
                    if (valid) {
                        block.employes.push(dataEmploye)
                    }
                }
                dateBlock.findByIdAndUpdate(datesB._id, {
                    $set: {
                        blocks: datesB.blocks
                    }
                }).then(ready => {})
            }
            res.json({status: 'ok'})
        }
    } catch (err) {
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

dates.post('/normalizeDatesBlocksColation', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const dataEmploye = {
        name: req.body.name,
        id: req.body.id,
        class: req.body.class,
        position: 0,
        valid: false,
        img: "no",
        commission: 0
    }
    try {
        const datesBlocks = await dateBlock.find()
        if(datesBlocks.length > 0){
            for (const datesB of datesBlocks) {
                for (const block of datesB.blocks) {
                    if (block.hour == "13:30" || block.hour == "13:45" || block.hour == "14:00" || block.hour == "14:15") {
                        for (const key in block.employes) {
                            const employe = block.employes[key]
                            if (employe.id == dataEmploye.id) {
                                block.employes.splice(key, 1)
                            }
                        }
                    }
                }
                dateBlock.findByIdAndUpdate(datesB._id, {
                    $set: {
                        blocks: datesB.blocks
                    }
                }).then(ready => {})
            }
            res.json({status: 'ok'})
        }
    } catch (err) {
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


//Fin de la api (Retorna: Datos de la cita) -- Api end (Return: date´s data)

// -----------------------------------------------------------------------------

//Api que elimina una cita (Ingreso: ObejctId de la cita) -- Api that delete a date (Input: date´s ObjectId)

dates.delete('/:id', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)
    const Employe = connect.useDb(database).model('employes', employeSchema)
    try{
        const findDate = await date.findById(req.params.id)
        const dateFind = findDate.start.split(' ')[0]
        const branch = findDate.branch
        const hour = findDate.start.split(' ')[1]
        const end = findDate.end.split(' ')[1]
        const employe = findDate.employe
        const query = [
            { 'dateData.date': dateFind[1] == "-" ? "0"+dateFind : dateFind },
            { 'dateData.branch': branch }
        ]
        try{
            const findDateEmploye = await Employe.findById(employe.id)
            const dayDate = new Date(findDate.start).getDay()
            var valid = false
            for (const dayEmploye of findDateEmploye.days) {
                if (dayDate == dayEmploye.day) {
                    valid = true
                    break
                }
            }
            if (valid) {
                try {
                    const findDateBlock = await dateBlock.findOne({
                        $and: [
                            { 'dateData.date': dateFind[1] == "-" ? "0"+dateFind : dateFind },
                            { 'dateData.branch': branch }
                        ]
                    })
                    var validBlock = false
                    try {
                        for (const block of findDateBlock.blocks) {
                            if (block.hour == hour) {
                                validBlock = true
                            }
                            if (block.hour == end) {
                                validBlock = false
                                break
                            }
                            if (validBlock) {
                                var validBlocked = false

                                block.employeBlocked.forEach((element, index) => {
                                    if (element.employe == employe.id && element.type == 'date') {
                                        block.employeBlocked.splice(index, 1)
                                        validBlocked = true
                                    }
                                });
                                
                                block.employeBlocked.forEach((element, index) => {
                                    if (element.employe == employe.id && element.type == 'blocking') {
                                        validBlocked = false
                                    }
                                });
                                
                                if(validBlocked){
                                    var validEmp = true
                                    block.employes.forEach(elementEmp => {
                                        if(elementEmp.id == employe.id){
                                            validEmp = false
                                        }
                                    })
                                    
                                    if(validEmp){
                                        block.employes.push({
                                            name: employe.name,
                                            id: employe.id,
                                            class: employe.class,
                                            position: 20,
                                            valid: false,
                                            img: employe.img
                                        })
                                    }
                                    
                                }
                            }
                        }
                        // logDates.info(`********* bloques: ${JSON.stringify(findDateBlock)} ***********`);
                        try {
                            const editDateBlock = await dateBlock.findByIdAndUpdate(findDateBlock._id, {
                                $set: {
                                    blocks: findDateBlock.blocks
                                }
                            })
                            
                            try {
                                const findConfig = await Configuration.findOne({
                                    branch: findDate.branch
                                })
                               
                                try {
                                    const removeDate = await date.findByIdAndRemove(req.params.id)
                                    res.json({ status: 'deleted', data: findDate, branchName: findConfig.businessName, branchEmail: findConfig.businessEmail, logo: findConfig.bussinessLogo, removed: removeDate })
                                } catch (err) {
                                    const Log = new LogService(
                                        req.headers.host, 
                                        req.body, 
                                        req.params, 
                                        err, 
                                        '', 
                                        req.headers['x-database-connect'], 
                                        req.route
                                    )
                                    const dataLog = await Log.createLog()
                                    res.send('failed api with error, '+ dataLog.error)
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
                                const dataLog = await Log.createLog()
                                res.send('failed api with error, '+ dataLog.error)
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
                            const dataLog = await Log.createLog()
                            res.send('failed api with error, '+ dataLog.error)
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
                        const dataLog = await Log.createLog()
                        res.send('failed api with error, '+ dataLog.error)
                    }
                } catch (err) {
                    const Log = new LogService(
                        req.headers.host, 
                        req.body, 
                        req.params, 
                        err, 
                        '', 
                        req.headers['x-database-connect'], 
                        req.route
                    )
                    const dataLog = await Log.createLog()
                    res.send('failed api with error, '+ dataLog.error)
                }
            }else{
                try {
                    const findDateBlock = await dateBlock.findOne({
                        $and: [
                            { 'dateData.date': dateFind[1] == "-" ? "0"+dateFind : dateFind },
                            { 'dateData.branch': branch }
                        ]
                    })
                    var valid = false
                    try {
                        for (const block of findDateBlock.blocks) {
                            if (block.hour == hour) {
                                valid = true
                            }
                            if (block.hour == end) {
                                valid = false
                                break
                            }
                            if (valid) {
                                block.employeBlocked.forEach((element, index) => {
                                    if (element.employe == employe.id && element.type == "date") {
                                        block.employeBlocked.splice(index, 1)
                                    }
                                });
                                
                            }
                        }
                        try {
                            const editDateBlock = await dateBlock.findByIdAndUpdate(findDateBlock._id, {
                                $set: {
                                    blocks: findDateBlock.blocks
                                }
                            })
                            
                            try {
                                const findConfig = await Configuration.findOne({
                                    branch: findDate.branch
                                })
                               
                                try {
                                    const removeDate = await date.findByIdAndRemove(req.params.id)
                                    res.json({ status: 'deleted', data: findDate, branchName: findConfig.businessName, branchEmail: findConfig.businessEmail, logo: findConfig.bussinessLogo, removed: removeDate })
                                } catch (err) {
                                    const Log = new LogService(
                                        req.headers.host, 
                                        req.body, 
                                        req.params, 
                                        err, 
                                        '', 
                                        req.headers['x-database-connect'], 
                                        req.route
                                    )
                                    const dataLog = await Log.createLog()
                                    res.send('failed api with error, '+ dataLog.error)
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
                                const dataLog = await Log.createLog()
                                res.send('failed api with error, '+ dataLog.error)
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
                            const dataLog = await Log.createLog()
                            res.send('failed api with error, '+ dataLog.error)
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
                        const dataLog = await Log.createLog()
                        res.send('failed api with error, '+ dataLog.error)
                    }
                } catch (err) {
                    const Log = new LogService(
                        req.headers.host, 
                        req.body, 
                        req.params, 
                        err, 
                        '', 
                        req.headers['x-database-connect'], 
                        req.route
                    )
                    const dataLog = await Log.createLog()
                    res.send('failed api with error, '+ dataLog.error)
                }
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
            const dataLog = await Log.createLog()
            res.send('failed api with error, '+ dataLog.error)
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
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Fin de la api (Retorna: Respuesta simple) -- Api end (Return: Simple response)

// -----------------------------------------------------------------------------

dates.post('/createBlockingHour', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const HourBlocking = connect.useDb(database).model('hoursblocking', dateBlockingSchema)
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)
    const date = connect.useDb(database).model('dates', dateSchema)

    const splitDate = req.body.dateBlocking.split('-')
    const Day = new Date(splitDate[1] + '-' + splitDate[0] + '-' + splitDate[2] + ' 10:00').getDay()
    const employes = req.body.employes


    var data = {
        branch: req.body.branch,
        dateBlocking: splitDate[1] + '-' + splitDate[0] + '-' + splitDate[2],
        dateBlockings: new Date(splitDate[1] + '-' + splitDate[0] + '-' + splitDate[2] + " 12:00"),
        employe: req.body.employe,
        start: req.body.start,
        end: req.body.end
    }

    try {
        const findDay = await dateBlock.findOne({
            $and: [
                { 'dateData.branch': req.body.branch },
                { 'dateData.date': data.dateBlocking }
            ]
        })
        
        if (findDay) {
            var valid = false
            var valid2 = true
            var valid3 = false 
            var valid4 = false
            var validAll = true
            var validStep = true
            for (const index in findDay.blocks) {
                const block = findDay.blocks[index]
                
                if (block.hour == req.body.start) {
                    if (index == 0 && valid2) {
                        findDay.blocks[0].employeBlocked.forEach(element => {
                            if(element.type == 'blocking'){
                                if(element.employe == data.employe.id){
                                    validAll = false
                                    valid3 = true
                                }
                            }
                        });
                        if(valid3){
                            break
                        }
                        findDay.blocks[0].employeBlocked.push({employe: data.employe.id, type: 'blocking'})
                    }
                    valid = true
                    valid4 = true
                    validStep = false
                }
                if (block.hour == req.body.end) {
                    valid = false
                    break
                }
                if (parseFloat(req.body.start.split(":")[0]) < parseFloat(block.hour.split(":")[0]) && validStep) {
                    if (valid2) {
                        valid = true
                        findDay.blocks[0].employeBlocked.forEach(element => {
                            if(element.type == 'blocking'){
                                if(element.employe == data.employe.id){
                                    validAll = false
                                    valid3 = true
                                }
                            }
                        });
                        if(valid3){
                            break
                        }
                        findDay.blocks[0].employeBlocked.push({employe: data.employe.id, type: 'blocking'})
                        valid2 = false
                    }
                }
                
                if (validStep && parseFloat(req.body.start.split(":")[0]) == parseFloat(block.hour.split(":")[0]) && parseFloat(req.body.start.split(":")[1]) < parseFloat(block.hour.split(":")[1])) {
                    if (valid2) {
                        valid = true
                        findDay.blocks[0].employeBlocked.forEach(element => {
                            if(element.type == 'blocking'){
                                if(element.employe == data.employe.id){
                                    validAll = false
                                    valid3 = true
                                }
                            }
                        });
                        if(valid3){
                            break
                        }
                        findDay.blocks[0].employeBlocked.push({employe: data.employe.id, type: 'blocking'})
                        valid2 = false
                    }
                }
                if (block.hour == findDay.blocks[findDay.blocks.length -1] && parseFloat(req.body.end.split(":")[0]) > parseFloat(findDay.blocks[findDay.blocks.length -1].split(":")[0])) {
                    valid = false
                    break
                }
                if (valid) {
                    if(valid4){
                        block.employeBlocked.forEach(element => {
                            if(element.type == 'blocking'){
                                if(element.employe == data.employe.id){
                                    validAll = false
                                    valid3 = true
                                }
                            }
                        });
                        if(valid3){
                            break
                        }
                    }
                    
                    block.employeBlocked.push({employe: data.employe.id, type: 'blocking'})
                    for (const key in block.employes) {
                        const employe = block.employes[key]
                        if (employe.id == data.employe.id) {
                            block.employes.splice(key, 1)
                        }
                    }
                }
            }
            if (validAll) {
                try {
                    const editBlockDate = await dateBlock.findByIdAndUpdate(findDay._id, {
                        $set: { blocks: findDay.blocks }
                    })
                    try {
                        const createDateBlocking = await date.create({
                            branch: data.branch,
                            start: data.dateBlocking + " " + data.start,
                            end: data.dateBlocking + " " + data.end,
                            title: "Bloqueo",
                            split: data.employe.id,
                            class: "classBlock",
                            createdAt: data.dateBlockings,
                            employe: data.employe,
                            isBlocked: true
                        })
                        if (createDateBlocking) {
                            data.dateId = createDateBlocking._id
                            try {
                                const createHour = await HourBlocking.create(data)
                                if(createHour){
                                    res.json({ status: 'ok' })
                                }
                            } catch (err) {
                                const Log = new LogService(
                                    req.headers.host, 
                                    req.body, 
                                    req.params, 
                                    err, 
                                    req.requestToken, 
                                    req.headers['x-database-connect'], 
                                    req.route
                                )
                                const dataLog = await Log.createLog()
                                res.send('failed api with error, '+ dataLog.error)
                            }

                            
                        }
                    }catch(err){
                        console.log(err)
                    }
                    
                }catch (err) {
                    const Log = new LogService(
                        req.headers.host, 
                        req.body, 
                        req.params, 
                        err, 
                        req.requestToken, 
                        req.headers['x-database-connect'], 
                        req.route
                    )
                    const dataLog = await Log.createLog()
                    res.send('failed api with error, '+ dataLog.error)
                }
            }else{
                res.json({ status: 'busy' })
            }
            
        } else {
            //create a dateBlock register to block hour
            try {
                const findConfiguration = await Configuration.findOne({ branch: req.body.branch })
                const getDay = findConfiguration.blockHour.filter(day => day.day == Day)[0]
                var blocksFirst = []
                var splitHour = parseFloat(getDay.start.split(':')[0])
                var splitMinutes = getDay.start.split(':')[1]
                for (let i = 0; i < getDay.time / 15 + 1; i++) {
                    if (i == 0) {
                        blocksFirst.push({
                            hour: getDay.start,
                            validator: true,
                            employes: [],
                            employeBlocked: []
                        })
                        splitMinutes = parseFloat(splitMinutes) + 15
                        splitHour = splitMinutes == 60 ? splitHour + 1 : splitHour
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                    } else {
                        blocksFirst.push({
                            hour: splitHour + ':' + splitMinutes,
                            validator: true,
                            employes: [],
                            employeBlocked: []
                        })
                        splitMinutes = parseFloat(splitMinutes) + 15
                        splitHour = splitMinutes == 60 ? splitHour + 1 : splitHour
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                    }
                }
                for (let i = 0; i < employes.length; i++) {
                    const element = employes[i];
                    const restInit = element.restTime.split('/')[0]
                    const restEnd = element.restTime.split('/')[1]
                    var inspector = false
                    var hourInit = restInit.split(':')[0] + restInit.split(':')[1]
                    for (let u = 0; u < blocksFirst.length; u++) {
                        const elementTwo = blocksFirst[u];
                        var hour = elementTwo.hour.split(':')[0] + elementTwo.hour.split(':')[1]
                        if (parseFloat(hourInit) <= parseFloat(hour)) {
                            inspector = true
                            if (restEnd == elementTwo.hour) {
                                inspector = false
                                hourInit = 15432154451
                            }
                        }
                        if (!inspector) {
                            elementTwo.employes.push({ name: element.name, id: element.id, class: element.class, position: i, valid: false, img: element.img })
                            elementTwo.employeBlocked = []
                        }
                    }
                }

                for (let i = 0; i < blocksFirst.length; i++) {
                    const element = blocksFirst[i];
                    if (element.employes.length == 0) {
                        element.validator = false
                    }
                }

                const thisDate = new Date()
                const dateSelected = new Date(req.body.date)
                if (thisDate.getDate() == dateSelected.getDate() && thisDate.getMonth() == dateSelected.getMonth()) {
                    const hour = thisDate.getHours() - findConfiguration.datesPolitics.minTypeDate
                    for (const key in blocksFirst) {
                        const element = blocksFirst[key]

                        if (element.hour.split(':')[0] == hour) {
                            break
                        }
                        element.validator = 'unavailable'
                    }
                }

                const dataConfiguration = {
                    dateData: {
                        branch: req.body.branch,
                        date: data.dateBlocking,
                        dateFormat: new Date(data.dateBlocking + ' 10:00'),
                        dateDay: new Date(data.dateBlocking + ' 10:00').getDay()
                    },
                    blocks: blocksFirst
                }
                try {
                    const createBlockdate = await dateBlock.create(dataConfiguration)
                    if (createBlockdate) {
                        var valid = false
                        var valid2 = true
                        var validStep = true
                        for (const block of blocksFirst) {

                            if (block.hour == req.body.start) {
                                if (blocksFirst[0] == req.body.start) {
                                    blocksFirst[0].employeBlocked.push({employe: data.employe.id, type: 'blocking'})
                                    valid2 = false
                                }
                                valid = true
                                validStep = false
                            }
                            if (block.hour == req.body.end) {
                                valid = false
                                break
                            }

                            if (parseFloat(req.body.start.split(":")[0]) < parseFloat(block.hour.split(":")[0]) && validStep) {
                                valid = true
                                if (valid2) {
                                    blocksFirst[0].employeBlocked.push({employe: data.employe.id, type: 'blocking'})
                                    valid2 = false
                                }
                            }
                            
                            if (parseFloat(req.body.start.split(":")[0]) == parseFloat(block.hour.split(":")[0]) && parseFloat(req.body.start.split(":")[1]) < parseFloat(block.hour.split(":")[1]) && validStep) {
                                valid = true
                                if (valid2) {
                                    blocksFirst[0].employeBlocked.push({employe: data.employe.id, type: 'blocking'})
                                    valid2 = false
                                }
                            }
                            
                            if (valid) {
                                for (const key in block.employes) {
                                    const employe = block.employes[key]
                                    if (employe.id == data.employe.id) {
                                        block.employeBlocked.push({employe: data.employe.id, type: 'blocking'})
                                        data.employe = employe
                                        block.employes.splice(key, 1)
                                        break
                                    }
                                }
                            }
                        }
                        try {
                            const editBlockDate = await dateBlock.findByIdAndUpdate(createBlockdate._id, {
                                $set: { blocks: blocksFirst }
                            })
                            try {
                                const createDateBlocking = await date.create({
                                    branch: data.branch,
                                    start: data.dateBlocking + " " + data.start,
                                    end: data.dateBlocking + " " + data.end,
                                    title: "Bloqueo",
                                    split: data.employe.id,
                                    class: "classBlock",
                                    createdAt: data.dateBlockings,
                                    employe: data.employe,
                                    isBlocked: true
                                })
                                if (createDateBlocking) {
                                    data.dateId = createDateBlocking._id
                                    
                                    try {
                                        const createHour = await HourBlocking.create(data)
                                        if(createHour){
                                            res.json({ status: 'ok' })
                                        }
                                    } catch (err) {
                                        const Log = new LogService(
                                            req.headers.host, 
                                            req.body, 
                                            req.params, 
                                            err, 
                                            req.requestToken, 
                                            req.headers['x-database-connect'], 
                                            req.route
                                        )
                                        const dataLog = await Log.createLog()
                                        res.send('failed api with error, '+ dataLog.error)
                                    }
        
                                    
                                }
                            }catch(err){
                                console.log(err)
                            }
                        } catch (err) {
                            const Log = new LogService(
                                req.headers.host, 
                                req.body, 
                                req.params, 
                                err, 
                                req.requestToken, 
                                req.headers['x-database-connect'], 
                                req.route
                            )
                            const dataLog = await Log.createLog()
                            res.send('failed api with error, '+ dataLog.error)
                        }
                    }
                } catch (err) {
                    const Log = new LogService(
                        req.headers.host, 
                        req.body, 
                        req.params, 
                        err, 
                        req.requestToken, 
                        req.headers['x-database-connect'], 
                        req.route
                    )
                    const dataLog = await Log.createLog()
                    res.send('failed api with error, '+ dataLog.error)
                }
            } catch (err) {
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                const dataLog = await Log.createLog()
                res.send('failed api with error, '+ dataLog.error) }
            }
        } catch (err) {
            const Log = new LogService(
                req.headers.host, 
                req.body, 
                req.params, 
                err, 
                req.requestToken, 
                req.headers['x-database-connect'], 
                req.route
            )
            const dataLog = await Log.createLog()
            res.send('failed api with error, '+ dataLog.error)
        }
})

dates.post('/deleteBlockingHour', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const HourBlocking = connect.useDb(database).model('hoursblocking', dateBlockingSchema)
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const date = connect.useDb(database).model('dates', dateSchema)

    const data = {
        branch: req.body.branch,
        dateBlocking: req.body.dateBlocking,
        employe: req.body.employe,
        start: req.body.start,
        end: req.body.end
    }
    try {
        const findDay = await dateBlock.findOne({
            $and: [
                { 'dateData.branch': req.body.branch },
                { 'dateData.date': data.dateBlocking }
            ]
        })
        var valid = false
        var valid2 = true
        for (const block of findDay.blocks) {
            if (parseFloat(req.body.start.split(":")[0]) < parseFloat(block.hour.split(":")[0])) {
                valid = true
                if (valid2) {
                    for (let c = 0; c < 5; c++) {
                        findDay.blocks[0].employeBlocked.forEach((element,index) => {
                            if (element.employe == data.employe.id && element.type == 'blocking') {
                                findDay.blocks[0].employeBlocked.splice(index, 1)
                                findDay.blocks[0].employes.unshift(data.employe)
                            }
                            if (element.employe == data.employe.id && element.type == 'date') {
                                for (let indexB = 0; indexB < findDay.blocks[0].employes.length; indexB++) {
                                    const elementB = findDay.blocks[0].employes[indexB];
                                    if (elementB.id == data.employe.id) {
                                        findDay.blocks[0].employes.splice(indexB, 1)
                                    }
                                }
                            }
                        });

                    }
                    valid2 = false
                }
            }
            
            if (parseFloat(req.body.start.split(":")[0]) == parseFloat(block.hour.split(":")[0]) && parseFloat(req.body.start.split(":")[1]) < parseFloat(block.hour.split(":")[1])) {
                valid = true
                if (valid2) {
                    for (let c = 0; c < 5; c++) {
                        findDay.blocks[0].employeBlocked.forEach((element,index) => {
                            if (element.employe == data.employe.id && element.type == 'blocking') {
                                findDay.blocks[0].employeBlocked.splice(index, 1)
                                findDay.blocks[0].employes.unshift(data.employe)
                            }
                            if (element.employe == data.employe.id && element.type == 'date') {
                                for (let indexB = 0; indexB < findDay.blocks[0].employes.length; indexB++) {
                                    const elementB = findDay.blocks[0].employes[indexB];
                                    
                                    if (elementB.id == data.employe.id) {
                                        findDay.blocks[0].employes.splice(indexB, 1)
                                    }
                                }
                            }
                        });

                    }
                    valid2 = false
                }
            }
            if (block.hour == req.body.start) {
                if (findDay.blocks[0] == req.body.start) {
                    if (valid2) {
                        for (let c = 0; c < 5; c++) {
                            findDay.blocks[0].employeBlocked.forEach((element,index) => {
                                if (element.employe == data.employe.id && element.type == 'blocking') {
                                    findDay.blocks[0].employeBlocked.splice(index, 1)
                                    findDay.blocks[0].employes.unshift(data.employe)
                                }
                                if (element.employe == data.employe.id && element.type == 'date') {
                                    for (let indexB = 0; indexB < findDay.blocks[0].employes.length; indexB++) {
                                        const elementB = findDay.blocks[0].employes[indexB];
                                        
                                        if (elementB.id == data.employe.id) {
                                            findDay.blocks[0].employes.splice(indexB, 1)
                                        }
                                    }
                                }
                            });

                        }
                        valid2 = false
                    }
                }
                valid = true
            }
            if (block.hour == req.body.end) {
                valid = false
                break
            }
            
            if (valid) {
                
                if (block.employeBlocked && block.employeBlocked.length > 0) {
                    for (let c = 0; c < 5; c++) {
                        block.employeBlocked.forEach((element,index) => {
                            if (element.employe == data.employe.id && element.type == 'blocking') {
                                block.employeBlocked.splice(index, 1)
                                block.employes.unshift(data.employe)
                            }
                            
                        });
                        
                    }
                    
                }
            }
        }
        findDay.blocks.forEach(element => {
            element.employeBlocked.forEach(element2 => {
                if (element2.employe == data.employe.id && element2.type == 'date') {
                    for (let indexB = 0; indexB < element.employes.length; indexB++) {
                        const elementB = element.employes[indexB];
                        if (elementB.id == data.employe.id) {
                            element.employes.splice(indexB, 1)
                        }
                    }
                }
            });
        });
        try {
            const editBlockDate = await dateBlock.findByIdAndUpdate(findDay._id, {
                $set: { blocks: findDay.blocks }
            })
            try {
                const createHour = await HourBlocking.findByIdAndRemove(req.body.id)
                if(createHour){
                    if(req.body.idDate){
                        try{
                            const deleteDate = await date.findByIdAndRemove(req.body.idDate)
                            if(deleteDate){
                                res.json({ status: 'ok' })
                            }
                        }catch(err){
                            console.log(err)
                        }
                    }else{
                        res.json({ status: 'ok' })
                    }
                    
                }
                
            } catch (err) {
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                const dataLog = await Log.createLog()
                res.send('failed api with error, '+ dataLog.error)
            }
        } catch (err) {
            const Log = new LogService(
                req.headers.host, 
                req.body, 
                req.params, 
                err, 
                req.requestToken, 
                req.headers['x-database-connect'], 
                req.route
            )
            const dataLog = await Log.createLog()
            res.send('failed api with error, '+ dataLog.error)
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Api que busca y crea los bloques de horario de un empleado (Ingreso: date, restHour, timedate, branch, employe) -- api that find and create an employe´s time block (Input: date, restHour, timedate, branch, employe)

dates.post('/blockHours', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)
    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()
    const restHour = req.body.restHour
    const hoursdate = req.body.timedate
    try {
        const findDay = await dateBlock.findOne({
            $and: [
                { 'dateData.branch': req.body.branch },
                { 'dateData.date': dateDaily }
            ]
        })
        if (findDay) {
            var ifEmploye = false
            var blocks = []
            for (let i = 0; i < findDay.employeBlocks.length; i++) {
                const element = findDay.employeBlocks[i];
                if (element.employe == req.body.employe) {
                    ifEmploye = true
                    blocks = element.block
                    break
                }
            }
            
            if (ifEmploye) {
                for (let e = 0; e < blocks.length; e++) {
                    const element = blocks[e];
                    if (element.validator == false && blocks[e - 1].validator == true && e > 0) {
                        for (let u = 0; u < hoursdate / 15; u++) {
                            if (blocks[e - u]) {
                                blocks[e - u].validator = 'unavailable'
                            }
                        }
                    }
                    if (blocks.length - 1 == e) {
                        for (let u = 0; u < hoursdate / 15; u++) {
                            blocks[e - u].validator = 'unavailable'
                        }
                    }
                }
                res.json({ status: 'ok', data: blocks })
            } else {
                try {
                    const findConfiguration = await Configuration.findOne({
                        branch: req.body.branch
                    })
                    const getDay = findConfiguration.blockHour.filter(day => day.day == Day)
                    var initialBlock = []
                    var splitHour = getDay.start.split(':')[0]
                    var splitMinutes = getDay.start.split(':')[1]
                    for (let i = 0; i < getDay.time / 15; i++) {
                        if (i == 0) {
                            initialBlock.push({
                                hour: getDay.start,
                                validator: true
                            })
                            splitMinutes = parseFloat(splitMinutes + 15)
                            splitHour = splitMinutes == 60 ? splitHour++ : splitHour
                            splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                        } else {
                            initialBlock.push({
                                hour: splitHour + ':' + splitMinutes,
                                validator: true
                            })
                            splitMinutes = parseFloat(splitMinutes + 15)
                            splitHour = splitMinutes == 60 ? splitHour++ : splitHour
                            splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                        }
                    }
                    for (let e = 0; e < initialBlock.length; e++) {
                        const element = initialBlock[e];
                        if (element.hour == restHour.start) {
                            for (let u = 0; u < restHour.time / 15 - 1; u++) {
                                initialBlock[e + u].validator = false
                            }
                        }
                    }
                    try {
                        const findDay = await dateBlock.findByIdAndUpdate(findDay._id, {
                            $push: {
                                employeBlocks: {
                                    employe: req.body.employe,
                                    block: initialBlock
                                }
                            }
                        })
                        for (let e = 0; e < initialBlock.length; e++) {
                            const element = initialBlock[e];
                            if (element.validator == false && initialBlock[e - 1].validator == true && e > 0) {
                                for (let u = 0; u < hoursdate / 15; u++) {
                                    if (initialBlock[e - u]) {
                                        initialBlock[e - u].validator = 'unavailable'
                                    }
                                }
                            }
                            if (initialBlock.length - 1 == e) {
                                for (let u = 0; u < hoursdate / 15; u++) {
                                    initialBlock[e - u].validator = 'unavailable'
                                }
                            }
                        }
                        res.json({ status: 'ok', data: initialBlock })
                    } catch (err) {
                        const Log = new LogService(
                            req.headers.host, 
                            req.body, 
                            req.params, 
                            err, 
                            req.requestToken, 
                            req.headers['x-database-connect'], 
                            req.route
                        )
                        const dataLog = await Log.createLog()
                        res.send('failed api with error, '+ dataLog.error)
                    }
                } catch (err) {
                    const Log = new LogService(
                        req.headers.host, 
                        req.body, 
                        req.params, 
                        err, 
                        req.requestToken, 
                        req.headers['x-database-connect'], 
                        req.route
                    )
                    const dataLog = await Log.createLog()
                    res.send('failed api with error, '+ dataLog.error)
                }
            }
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, branch, employes, employesServices) -- api that find and create first time blocks (Input: date, timedate, branch, employes, employesServices)

dates.post('/editBlocksFirst', async (req, res) => {
    const hoursdate = req.body.timedate
    const blocks = req.body.block
    if (req.body.firstBlock) {
        const employesServices = req.body.employesServices
        
        if (req.body.online) {
            const employes = req.body.employes
            employesServices.forEach((emp,index) => {
                if (emp.name != "Primera disponible") {
                    emp.valid = false
                    var validOnline = false
                    employes.forEach(empl => {
                        if (emp.id == empl.id) {
                            validOnline = true
                        }
                    });
                    emp.valid = validOnline
                }
            });
        }

        for (const u in blocks) {
            const elementTwo = blocks[u];
            for (let o = 0; o < elementTwo.employes.length; o++) {
                const elementThree = elementTwo.employes[o];
                elementThree.valid = false
            }
        }
        for (const i in employesServices) {
            const element = employesServices[i];
            for (const u in blocks) {
                const elementTwo = blocks[u];
                for (let o = 0; o < elementTwo.employes.length; o++) {
                    const elementThree = elementTwo.employes[o];
                    if (element.id == elementThree.id && element.valid == true) {
                        elementThree.valid = true
                    }
                }
            }
        }
        for (const i in blocks) {
            const element = blocks[i];
            if (element.validator == 'select') {
                if (element.employes.length > 0) {
                    element.validator = false
                    for (const e in element.employes) {
                        const elementTwo = element.employes[e];
                        if (elementTwo.valid) {
                            element.validator = true
                            break
                        }
                    }
                } else {
                    element.validator = false
                }
            }
        }
        for (let i = 0; i < employesServices.length; i++) {
            const employeService = employesServices[i];
            for (let e = 0; e < blocks.length; e++) {
                const block = blocks[e];
                var valid = false
                for (let r = 0; r < block.employes.length; r++) {
                    const employeBlock = block.employes[r];
                    if (employeBlock.id == employeService.id && employeService.valid == true) {
                        valid = true
                    }
                }
                if (valid == false && blocks[e - 1]) {
                    for (let u = 1; u < hoursdate / 15; u++) {
                        if (blocks[e - u]) {
                            for (let r = 0; r < blocks[e - u].employes.length; r++) {
                                if (blocks[e - u].employes[r].id == employeService.id) {
                                    blocks[e - u].employes[r].valid = false
                                }
                            }
                        }
                    }
                }
            }
        }
        for (let e = 0; e < blocks.length; e++) {
            const element = blocks[e];
            if (blocks[e - 1]) {
                if (element.validator == true) {
                    var valid = true
                    for (let i = 0; i < element.employes.length; i++) {
                        const elementTwo = element.employes[i];
                        if (elementTwo.valid == true) {
                            valid = false
                            break
                        }
                    }
                    if (valid) {
                        element.validator = 'unavailable'
                    }
                }
                if (element.validator == false && blocks[e - 1].validator == true && e > 0) {
                    for (let u = 1; u < hoursdate / 15; u++) {
                        if (blocks[e - u]) {
                            blocks[e - u].validator = 'unavailable'
                        }
                    }
                }
                if (blocks.length - 1 == e) {
                    for (let u = 0; u < hoursdate / 15; u++) {
                        if (blocks[e - u]) {
                            blocks[e - u].validator = 'unavailable'
                        }
                    }
                }
            }
        }
        for (const block of blocks) {
            if (block.employes.length > 0) {
                var valid = true
                block.employes.forEach(element => {
                    if (element.valid) {
                        valid = false
                    }
                })
                if (valid) {
                    block.validator = 'unavailable'
                }
            }
        }
        res.json({ status: 'ok', data: blocks })
    } else {
        const employeSelect = req.body.employeSelect
        const blockEmploye = []
        for (const block of blocks) {
            if (block.sameDay) {
                blockEmploye.push({ hour: block.hour, validator: 'unavailable', origin: 'unavailable' })
            } else {
                var valid = false
                var validSameEmploye = true
                if (block.validator == 'select') {
                    block.employeBlocked.forEach(emp => {
                        if (emp.employe == employeSelect) {
                            validSameEmploye = false
                            block.validator = false
                            blockEmploye.push({ hour: block.hour, validator: false, origin: false })
                        }
                    });
                    if (validSameEmploye) {
                        block.validator = true
                        blockEmploye.push({ hour: block.hour, validator: true, origin: true })
                        block.employes.unshift(req.body.employeObject)
                    }
                }else{
                    for (const employe of block.employes) {
                        if (employe.id == employeSelect) {
                            blockEmploye.push({ hour: block.hour, validator: true, origin: true })
                            valid = true
                            break
                        }
                    }
                    if (!valid) {
                        blockEmploye.push({ hour: block.hour, validator: false, origin: false })
                    }
                }
            }
        }
        for (let e = 0; e < blockEmploye.length; e++) {
            const element = blockEmploye[e];
            if (blockEmploye[e - 1]) {
                if (element.validator == false && blockEmploye[e - 1].validator == true && e > 0) {
                    for (let u = 1; u < hoursdate / 15; u++) {
                        if (blockEmploye[e - u]) {
                            blockEmploye[e - u].validator = 'unavailable'
                            blockEmploye[e - u].origin = 'unavailable'
                        }
                    }
                }
                if (blockEmploye.length - 1 == e) {
                    for (let u = 0; u < hoursdate / 15; u++) {
                        if (blockEmploye[e - u]) {
                            blockEmploye[e - u].validator = 'unavailable'
                            blockEmploye[e - u].origin = 'unavailable'
                        }
                    }
                }
            }
        }
        for (const block of blockEmploye) {
            if (block.sameDay) {
                block.validator = 'unavailable'
            }
        }
        res.json({ status: 'ok', data: blocks, blockEmploye: blockEmploye })
    }


})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

dates.put('/uploadDesign/:id', protectRoute, uploadS3.array('image', 3), (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)

    const images = []
    for (let index = 0; index < req.files.length; index++) {
        const element = req.files[index];
        images.push(element.location)
    }
    if (req.body.imagePrev != '') {
        const split = req.body.imagePrev.split(',')
        for (let indexTwo = 0; indexTwo < split.length; indexTwo++) {
            const elementTwo = split[indexTwo];
            images.push(elementTwo)
        }
    }
    date.findByIdAndUpdate(req.params.id, {
        $set: {
            imgDesign: images
        }
    })
        .then(change => {
            res.json({ status: 'ok', image: images })
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

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

dates.put('/confirmDate/:id', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)
    date.findByIdAndUpdate(req.body.id, {
        $set: {
            confirmation: true
        }
    })
    .then(confirmDate => {
        Configuration.findOne({
            branch: confirmDate.branch
        })
        .then(getConfigurations => {
            res.json({ status: 'ok', data: confirmDate, branchName: getConfigurations.businessName, branchEmail: getConfigurations.businessEmail, logo: getConfigurations.bussinessLogo })
        })
    })
    .catch(err => {
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

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

dates.put('/removeDate/:id', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)

    try {
        const confirmDate = await date.findByIdAndRemove(req.body.id)
        const Configuration = connect.useDb(database).model('configurations', configurationSchema)
        Configuration.findOne({
            branch: confirmDate.branch
        })
        .then(getConfigurations => {
            res.json({ status: 'ok', data: confirmDate, branchName: getConfigurations.businessName, branchEmail: getConfigurations.businessEmail, logo: getConfigurations.bussinessLogo })
        })
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            '', 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

dates.put('/removeImage/:id', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    const date = connect.useDb(database).model('dates', dateSchema)

    const images = req.body.images
    date.findByIdAndUpdate(req.params.id, {
        $set: {
            imgDesign: images
        }
    })
    .then(change => {
        res.json({ status: 'ok', change: change })
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

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, branch, employes, employesServices) -- api that find and create first time blocks (Input: date, timedate, branch, employes, employesServices)

dates.post('/blocksHoursFirst', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)
    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()
    const hoursdate = req.body.timedate
    const employes = req.body.employes
    const employesServices = req.body.employesServices

    if (req.body.online) {
        employesServices.forEach(emp => {
            if (emp.name != "Primera disponible") {
                var validOnline = false
                employes.forEach(empl => {
                    if (emp.id == empl.id) {
                        validOnline = true
                    }
                });

                emp.valid = validOnline
            }
        });
    }
    try {
        const finddate = await dateBlock.findOne({
            $and: [
                { 'dateData.branch': req.body.branch },
                { 'dateData.date': dateDaily }
            ]
        })

        if (finddate) {
            try {
                const findConfiguration = await Configuration.findOne({ branch: req.body.branch })
                const blocksFirst = finddate.blocks

                for (const block of blocksFirst) {
                    block.employeBlocked.forEach(element => {
                        block.employes.forEach((employe, index) => {
                            if (employe.id == element.employe) {
                                block.employes.splice(index,1)
                            }
                        });
                    });
                    for (const employe of block.employes) {
                        employe.valid = false
                    }
                }
                for (let i = 0; i < employesServices.length; i++) {
                    const element = employesServices[i];
                    for (let u = 0; u < blocksFirst.length; u++) {
                        const elementTwo = blocksFirst[u];
                        for (let o = 0; o < elementTwo.employes.length; o++) {
                            const elementThree = elementTwo.employes[o];
                            if (element.id == elementThree.id && element.valid == true ) {
                                elementThree.valid = true
                            }
                        }
                    }
                }
                for (let i = 0; i < employesServices.length; i++) {
                    const employeService = employesServices[i];
                    for (let e = 0; e < blocksFirst.length; e++) {
                        const block = blocksFirst[e];
                        var valid = false
                        for (let r = 0; r < block.employes.length; r++) {
                            const employeBlock = block.employes[r];
                            employeBlock.commission = employeService.commission
                            if (employeBlock.id == employeService.id) {
                                valid = true
                            }
                        }
                        if (valid == false && blocksFirst[e - 1]) {
                            for (let u = 0; u <= hoursdate / 15 - 1; u++) {
                                if (blocksFirst[e - u]) {
                                    for (let r = 0; r < blocksFirst[e - u].employes.length; r++) {
                                        if (blocksFirst[e - u].employes[r].id == employeService.id) {
                                            blocksFirst[e - u].employes[r].valid = false
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                for (let e = 0; e < blocksFirst.length; e++) {
                    const element = blocksFirst[e];
                    if (blocksFirst[e - 1]) {
                        if (element.validator == true) {
                            var valid = true
                            for (let i = 0; i < element.employes.length; i++) {
                                const elementTwo = element.employes[i];
                                if (elementTwo.valid == true) {
                                    valid = false
                                    break
                                }
                            }
                            if (valid) {
                                element.validator = 'unavailable'
                            }
                        }
                        if (element.validator == false && blocksFirst[e - 1].validator == true && e > 0) {
                            for (let u = 1; u <= hoursdate / 15; u++) {
                                if (blocksFirst[e - u]) {
                                    blocksFirst[e - u].validator = 'unavailable'
                                }
                            }
                        }
                        if (blocksFirst.length - 1 == e) {
                            for (let u = 0; u < hoursdate / 15; u++) {
                                if (blocksFirst[e - u]) {
                                    blocksFirst[e - u].validator = 'unavailable'
                                }
                            }
                        }
                    }
                }
                for (const employe of employes) {
                    for (const block of blocksFirst) {
                        var dictEmploye = {}
                        for (const blockEmploye of block.employes) {
                            if (dictEmploye[blockEmploye.id]) {
                                dictEmploye[blockEmploye.id]++
                            }else{
                                dictEmploye[blockEmploye.id] = 1
                            }
                            if (employe.id == blockEmploye.id) {
                                blockEmploye.commission = employe.commission
                            }
                        }
                        for (let index = 0; index < block.employes.length; index++) {
                            const employeID = block.employes[index];
                            if (dictEmploye[employeID.id] > 1) {
                                dictEmploye[employeID.id] = dictEmploye[employeID.id] - 1
                                block.employes.splice(index, 1)
                            }
                        }
                    }
                }
                for (const block of blocksFirst) {
                    block.employes.sort((a, b) => {
                        return a.commission - b.commission;
                    });
                }
                var index = 0
                for (const block of blocksFirst) {
                    
                    if (block.employes.length > 0) {
                        var valid = true
                        block.employes.forEach(element => {
                            if (element.valid) {
                                valid = false
                                block.validator = true
                            }
                        })
                        if (valid) {
                            block.validator = 'unavailable'
                        }
                    }else{
                        block.validator = false
                    }
                    if (blocksFirst.length - 1 == index) {
                        for (let u = 0; u < hoursdate / 15; u++) {
                            if (blocksFirst[index - u]) {
                                blocksFirst[index - u].validator = 'unavailable'
                            }
                        }
                    }
                    index++
                }

                const thisDate = new Date()
                const dateSelected = new Date(req.body.date)
                //ciclo para sacar a angela
                for (const block of blocksFirst) {
                    if (block.employes.length > 0) {
                        for (const key in block.employes) {
                            const employe = block.employes[key]
                            if ((employe.id == "6116b68328723d461421fde3" || employe.id == "62a39b7d01ead640f5b8b31a") && (dateSelected.getMonth() == 10 || dateSelected.getMonth() == 11 || dateSelected.getMonth() == 0)) {
                                block.employes.splice(key, 1);
                            }
                        }
                    }
                }

                // if (thisDate.getDate() == dateSelected.getDate() && thisDate.getMonth() == dateSelected.getMonth()) {
                //     const hour = thisDate.getHours() + findConfiguration.datesPolitics.minTypeDate
                //     const minutes = thisDate.getMinutes()
                //     for (const key in blocksFirst) {
                //         const element = blocksFirst[key]
                //         if (blocksFirst[0].hour.split(':')[0] >= hour && blocksFirst[0].hour.split(':')[1] >= minutes) {
                //             break
                //         }
                //         console.log(minutes)
                //         var minutesBlock = minutes >= 45 ? 0 : minutes
                //         console.log(minutesBlock)
                //         const hourBlock = minutes >= 45 ? (hour + 1) : hour
                //         if (element.hour.split(':')[0] == hourBlock && element.hour.split(':')[1] >= minutesBlock) {
                //             break
                //         }
                //         element.validator = 'unavailable'
                //         element.sameDay = true
                //     }
                // }
                res.json({ status: 'ok', data: blocksFirst, id: finddate._id })
            } catch (err) {
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
        } else {
            try {
                const findConfiguration = await Configuration.findOne({ branch: req.body.branch })
                const getDay = findConfiguration.blockHour.filter(day => day.day == Day)[0]
                var blocksFirst = []
                var splitHour = parseFloat(getDay.start.split(':')[0])
                var splitMinutes = getDay.start.split(':')[1]
                for (let i = 0; i < getDay.time / 15 + 1; i++) {
                    if (i == 0) {
                        blocksFirst.push({
                            hour: getDay.start,
                            validator: true,
                            employes: [],
                            employeBlocked: []
                        })
                        splitMinutes = parseFloat(splitMinutes) + 15
                        splitHour = splitMinutes == 60 ? splitHour + 1 : splitHour
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                    } else {
                        blocksFirst.push({
                            hour: splitHour + ':' + splitMinutes,
                            validator: true,
                            employes: [],
                            employeBlocked: []
                        })
                        splitMinutes = parseFloat(splitMinutes) + 15
                        splitHour = splitMinutes == 60 ? splitHour + 1 : splitHour
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                    }
                }
                for (let i = 0; i < employes.length; i++) {
                    const element = employes[i];
                    const restInit = element.restTime.split('/')[0]
                    const restEnd = element.restTime.split('/')[1]
                    var inspector = false
                    var hourInit = restInit.split(':')[0] + restInit.split(':')[1]
                    for (let u = 0; u < blocksFirst.length; u++) {
                        const elementTwo = blocksFirst[u];
                        var hour = elementTwo.hour.split(':')[0] + elementTwo.hour.split(':')[1]
                        if (parseFloat(hourInit) <= parseFloat(hour)) {
                            inspector = true
                            if (restEnd == elementTwo.hour) {
                                inspector = false
                                hourInit = 15432154451
                            }
                        }
                        if (!inspector) {
                            elementTwo.employes.push({ name: element.name, id: element.id, class: element.class, position: i, valid: false, img: element.img })
                            elementTwo.employeBlocked = []
                        }
                    }
                }
                for (let i = 0; i < blocksFirst.length; i++) {
                    const element = blocksFirst[i];
                    if (element.employes.length == 0) {
                        element.validator = false
                    }
                }

                const dataConfiguration = {
                    dateData: {
                        branch: req.body.branch,
                        date: req.body.date,
                        dateFormat: new Date(req.body.date + ' 10:00'),
                        dateDay: new Date(req.body.date + ' 10:00').getDay()
                    },
                    blocks: blocksFirst
                }
                try {
                    const createBlockdate = await dateBlock.create(dataConfiguration)
                    if (createBlockdate) {
                        for (let i = 0; i < employesServices.length; i++) {
                            const element = employesServices[i];
                            for (let u = 0; u < blocksFirst.length; u++) {
                                const elementTwo = blocksFirst[u];
                                for (let o = 0; o < elementTwo.employes.length; o++) {
                                    const elementThree = elementTwo.employes[o];
                                    if (element.id == elementThree.id) {
                                        elementThree.valid = true
                                    }
                                }
                            }
                        }
                        for (let i = 0; i < employesServices.length; i++) {
                            const employeService = employesServices[i];
                            for (let e = 0; e < blocksFirst.length; e++) {
                                const block = blocksFirst[e];
                                var valid = false
                                for (let r = 0; r < block.employes.length; r++) {
                                    const employeBlock = block.employes[r];
                                    if (employeBlock.id == employeService.id) {
                                        valid = true
                                    }
                                }
                                if (valid == false && blocksFirst[e - 1]) {
                                    for (let u = 1; u <= hoursdate / 15 - 1; u++) {
                                        if (blocksFirst[e - u]) {
                                            for (let r = 0; r < blocksFirst[e - u].employes.length; r++) {
                                                if (blocksFirst[e - u].employes[r].id == employeService.id) {
                                                    blocksFirst[e - u].employes[r].valid = false
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        for (let e = 0; e < blocksFirst.length; e++) {
                            const element = blocksFirst[e];
                            if (blocksFirst[e - 1]) {
                                if (element.validator == true) {
                                    var valid = true
                                    for (let i = 0; i < element.employes.length; i++) {
                                        const elementTwo = element.employes[i];
                                        if (elementTwo.valid == true) {
                                            valid = false
                                            break
                                        }
                                    }
                                    if (valid) {
                                        element.validator = 'unavailable'
                                    }
                                }
                                if (element.validator == false && blocksFirst[e - 1].validator == true && e > 0) {
                                    for (let u = 1; u <= hoursdate / 15; u++) {
                                        if (blocksFirst[e - u]) {
                                            blocksFirst[e - u].validator = 'unavailable'
                                        }
                                    }
                                }
                                if (blocksFirst.length - 1 == e) {
                                    for (let u = 0; u < hoursdate / 15; u++) {
                                        if (blocksFirst[e - u]) {
                                            blocksFirst[e - u].validator = 'unavailable'
                                        }
                                    }
                                }
                            }
                        }
                        var index = 0
                        for (const block of blocksFirst) {
                            if (block.employes.length > 0) {
                                var valid = true
                                block.employes.forEach(element => {
                                    if (element.valid) {
                                        valid = false
                                        block.validator = true
                                    }
                                })
                                if (valid) {
                                    block.validator = 'unavailable'
                                }
                            }else{
                                block.validator = false
                            }
                            if (blocksFirst.length - 1 == index) {
                                for (let u = 0; u < hoursdate / 15; u++) {
                                    if (blocksFirst[index - u]) {
                                        blocksFirst[index - u].validator = 'unavailable'
                                    }
                                }
                            }
                            index++
                        } 
                        const thisDate = new Date()
                        const dateSelected = new Date(req.body.date)
                        if (thisDate.getDate() == dateSelected.getDate() && thisDate.getMonth() == dateSelected.getMonth()) {
                            const hour = thisDate.getHours() + findConfiguration.datesPolitics.minTypeDate
                            for (const key in blocksFirst) {
                                const element = blocksFirst[key]
                                if (blocksFirst[0].hour.split(':')[0] >= hour) {
                                    break
                                }
                                if (element.hour.split(':')[0] == hour) {
                                    break
                                }
                                element.validator = 'unavailable'
                                element.sameDay = true
                            }
                        }
                        res.json({ status: 'ok', data: blocksFirst, id: createBlockdate._id, Stat: "from create" })
                    }
                } catch (err) {
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
            } catch (err) {
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
        }
    } catch (err) {
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

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api para editar bloques

dates.post('/editdateblockbefore', async (req, res) => {
    const blocks = req.body.block
    const employe = req.body.employe
    const start = req.body.start
    const end = req.body.end
    const originalEmploye = req.body.originalEmploye
    employe.valid = true
    var valid = false
    if (originalEmploye == employe.id) {
        try{
            for (const block of blocks) {
                if (valid) {
                    if (block.hour == end) {
                        valid = false
                        break
                    }else{
                        block.employeBlocked.forEach((element, index) => {
                            if (element.employe == employe.id) {
                                block.employeBlocked.splice(index, 1)
                            }
                        });
                        block.employes.push(employe)
                        block.validator = true
                    }
                }
                if (block.hour == start) {
                    block.employeBlocked.forEach((element, index) => {
                        if (element.employe == employe.id) {
                            block.employeBlocked.splice(index, 1)
                        }
                    });
                    valid = true
                    block.employes.push(employe)
                    block.validator = true
                }
            }
            res.json({ data: blocks })
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
        res.json({ data: blocks })
    }
    
})

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, hour, branch, employe) -- api that find and create first time blocks (Input: date, timedate, hour, branch, employe)

dates.post('/selectDatesBlocks', async (req, res) => {
    const hoursdate = req.body.timedate
    const hourSelect = req.body.hour
    const employe = req.body.employe
    const blocks = req.body.block
    const oldEmploye = req.body.oldEmploye
    if (req.body.firstBlock) {
        for (let i = 0; i < blocks.length; i++) {
            const element = blocks[i];
            if (element.validator == 'select') {
                element.validator = true
                if (blocks[i + 1]) {
                    if (blocks[i + 1].validator == 'select') {
                        blocks[i].employes.unshift(oldEmploye)
                    }  
                }
                for (const employeFor in element.employeBlocked) {
                    if (element.employeBlocked[employeFor].employe == oldEmploye.id) {
                        element.employeBlocked.splice(employeFor, 1)
                    }
                }
            }
        }

        for (let i = 0; i < blocks.length; i++) {
            const element = blocks[i];
            if (element.hour == hourSelect) {
                for (let u = 0; u < hoursdate / 15; u++) {
                    for (let e = 0; e < blocks[i + u].employes.length; e++) {
                        if (blocks[i + u].employes[e].id == employe.id) {
                            blocks[i + u].employes.splice(e, 1)
                            blocks[i + u].employeBlocked.push({employe: employe.id, type: 'date'})
                        }
                    }
                    if (blocks[i + u].employes.length == 0) {
                        blocks[i + u].validator = false
                    }
                }
            }
        }
        var end = ''
        for (let i = 0; i < blocks.length; i++) {
            const element = blocks[i];
            if (element.hour == hourSelect) {
                for (let u = 0; u <= hoursdate / 15; u++) {
                    blocks[i + u].validator = 'select'
                    if (u == hoursdate / 15) {
                        end = blocks[i + u].hour
                    }
                }
            }
        }
        res.json({ status: 'ok', data: blocks, end: end })
    } else {
        //algoritmo para bloques por empleado
        const blockFirst = req.body.blockFirst
        // if (!req.body.ifFirstClick) {
            for (let i = 0; i < blocks.length; i++) {
                const element = blocks[i];
                if (element.validator == 'select') {
                    element.validator = element.origin
                }
            }
            for (let i = 0; i < blockFirst.length; i++) {
                const element = blockFirst[i];
                if (element.validator == 'select') {
                    element.validator = true
                    if (blockFirst[i + 1]) {
                        if (blockFirst[i + 1].validator == 'select') {
                            blockFirst[i].employes.unshift(employe) 
                        }
                    }
                    for (const employeFor in element.employeBlocked) {
                        if (element.employeBlocked[employeFor].employe == employe.id) {
                            element.employeBlocked.splice(employeFor, 1)
                        }
                    }
                }
            }
        // }
        for (let e = 0; e < blocks.length; e++) {
            const block = blocks[e]
            if (block.hour == hourSelect) {
                for (let i = 0; i <= hoursdate / 15; i++) {
                    blocks[e + i].validator = 'select'
                }
            }
        }
        for (let i = 0; i < blockFirst.length; i++) {
            const element = blockFirst[i];
            if (element.hour == hourSelect) {
                for (let u = 0; u < hoursdate / 15; u++) {
                    for (let e = 0; e < blockFirst[i + u].employes.length; e++) {
                        if (blockFirst[i + u].employes[e].id == employe.id) {
                            blockFirst[i + u].employes.splice(e, 1)
                            blockFirst[i + u].employeBlocked.push({employe: employe.id, type: 'date'})
                        }
                    }
                    if (blockFirst[i + u].employes.length == 0) {
                        blockFirst[i + u].validator = false
                    }
                }
            }
        }
        var end = ''
        for (let i = 0; i < blockFirst.length; i++) {
            const element = blockFirst[i];
            if (element.hour == hourSelect) {
                for (let u = 0; u <= hoursdate / 15; u++) {
                    blockFirst[i + u].validator = 'select'
                    if (u == hoursdate / 15) {
                        end = blockFirst[i + u].hour
                    }
                }
            }
        }
        res.json({ status: 'ok', data: blocks, blockFirst: blockFirst, end: end })
    }

})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, hour, branch, employe) -- api that find and create first time blocks (Input: date, timedate, hour, branch, employe)

// dates.post('/selectdatesBlocks', async (req, res) => {

//     const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
//     const Configuration = connect.useDb(database).model('configurations', configurationSchema)

//     const dateDaily = req.body.date
//     const Day = new Date(dateDaily).getDay()
//     const hoursdate = req.body.timedate
//     const hourSelect = req.body.hour
//     const employe = req.body.employe
//     const block = req.body.block

//     try{
//         const finddate = await dateBlock.findOne({
//             $and: [ 
//                 {'dateData.branch': req.body.branch},
//                 {'dateData.date': dateDaily}
//             ]
//         })
//         if (finddate) {
//             // cambiar employeBlocks a hash table
//             const findEmploye = finddate.employeBlocks.find(element => element.employe == employe)
//             const findIndex = finddate.employeBlocks.findIndex(findEmploye)
//             if (!req.body.ifFirstClick) {
//                 for (let i = 0; i < block.length; i++) {
//                     const element = block[i];
//                     if (element.validator == 'select') {
//                         element.validator = true
//                     }
//                 }
//             }
//             for (let i = 0; i < block.length; i++) {
//                 const element = block[i];
//                 if (element.hour == hourSelect) {
//                     for (let u = 1; u < hoursdate / 15 - 2; u++) {
//                         block[i + u].validator = false
//                     }
//                 }
//             }
//             try{
//                 const blockEdit = await dateBlock.findByIdAndUpdate(finddate._id, {
//                     $splice: [
//                         employeBlocks, 
//                         findIndex, 
//                         1
//                     ],
//                     $push: {
//                         employeBlocks: findEmploye
//                     }
//                 })
//                 for (let i = 0; i < block.length; i++) {
//                     const element = block[i];
//                     if (element.hour == hourSelect) {
//                         for (let u = 0; u <= hoursdate / 15; u++) {
//                             block[i + u].validator = 'select'
//                         }
//                     }
//                 }
//                 res.json({status: 'ok', data: block})
//             }catch(err){res.send(err)}
//         }
//     }catch(err){res.send(err)}
// })

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

//-----------------------------------------------------------------------------

//Api que verifica si no se esta repitiendo una cita () -- Api that verify if a date is not repiting (Input: )

dates.post('/verifydate', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)

    const datadate = req.body.dataDate
    const datee = req.body.date
    try {
        const finddate = await dateBlock.findOne({
            $and: [
                { 'dateData.branch': req.body.branch },
                { 'dateData.date': datee }
            ]
        })
        if (finddate) {
            for (let i = 0; i < datadate.serviceSelectds.length; i++) {
                var validFinally = false
                const element = datadate.serviceSelectds[i];
                var index = 0
                for (const key in finddate.blocks) {
                    var validID = true
                    const elementTwo = finddate.blocks[key]
                    if (element.blocks[0].employes) {
                        if (element.blocks[key].validator == 'select' && element.blocks[index + 1]) {
                            if (element.blocks[index + 1].validator == 'select') {
                                for (const employe of elementTwo.employes) {
                                    if (employe.id == element.employeId) {
                                        validID = false
                                    }
                                }
                                if (validID) {
                                    validFinally = true
                                    break
                                }
                            }
                        }
                        index++
                    } else {
                        if (element.blocksFirst[key].validator == 'select' && element.blocksFirst[index + 1]) {
                            if (element.blocksFirst[index + 1].validator == 'select') {
                                for (const employe of elementTwo.employes) {
                                    if (employe.id == element.employeId) {
                                        validID = false
                                    }
                                }
                                if (validID) {
                                    validFinally = true
                                    break
                                }
                            }
                        }
                        index++
                    }
                }
                if (validFinally) {
                    break
                }
            }
            res.json({ status: validFinally })
        }else{
            res.json({ status: false })
        }
    } catch (err) { 
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            '', 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

//Fin de la api (Retorna: status)  -- Api end (Return: status)

dates.post('/noOneLender', (req, res) => {
    const database = req.headers['x-database-connect'];

    const User = connect.useDb(database).model('users', userSchema)
    const dates = connect.useDb(database).model('dates', dateSchema)
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const dataCitas = []
    const dataDate = req.body.dataDate
    const client = req.body.client
    const date = new Date(req.body.date + ' 10:00')
    var nameFile = ''
    if (req.body.pdf == 'not') {
        nameFile = ''
    } else {
        nameFile = req.body.pdf
    }
    const dateID = new Date()
    const id = dateID.getTime()
    
    for (let index = 0; index < dataDate.serviceSelectds.length; index++) {
        const element = dataDate.serviceSelectds[index];
        
        var data = {
            branch: req.body.branch,
            start: req.body.date + ' ' + element.start,
            end: req.body.date + ' ' + element.end,
            sort: element.sort,
            title: element.name,
            content: req.body.client.name,
            split: element.employeId,
            extraData: req.body.extraData,
            services: {
                id: element.service_id,
                name: element.name,
                commission: element.commission,
                price: element.price,
                discount: element.discount,
                products: element.products,
                employes: element.employes
            },
            duration: element.duration,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                location: client.location,
                phone: client.phone,
            },
            employe: {
                id: element.employeId,
                name: element.realEmploye,
                class: element.class,
                img: 'no'
            },
            microServices: element.microServiceSelect ? element.microServiceSelect : [],
            typeCreation: req.body.typeCreation,
            imgDesign: [],
            class: element.class,
            process: true,
            confirmation: false,
            imgDesign: [],
            createdAt: date,
            confirmationId: id,
            typePay: client.pay,
            payPdf: nameFile
        }
        dataCitas.push(data)
    }

    
    dateBlock.findById(req.body.blockId)
    .then(blocks => {
        var ids = [];
        for (let i = 0; i < dataCitas.length; i++) {
            dates.create(dataCitas[i])
            .then(citas => {
                ids.push({_id : citas._id, employeId: citas.employe.id})
            })
            .catch(err => console.log(err))
            var valid = false
            for (const block of blocks.blocks){
                if(block.hour == dataCitas[i].start.split(" ")[1]){
                    valid = true
                }
                if(block.hour == dataCitas[i].end.split(" ")[1]){
                    valid = false
                    break
                }
                if(valid){
                    block.employes.forEach((element, index2) => {
                        if (element.id == dataCitas[i].employe.id) {
                            //bloquear
                            block.employes.splice(index2, 1)
                            block.employeBlocked.push({employe: dataCitas[i].employe.id, type: 'date'})
                        }
                    });
                    if (block.employes.length > 0) {
                        block.validator = true
                    }else {
                        block.validator = false
                    }
                }
            }
        }
        dateBlock.findByIdAndUpdate(req.body.blockId, {
            $set: {
                blocks: blocks.blocks
            }
        }).then(edit => {
            if (ids.length > 0) {
                res.json({ status: 'ok', id: ids })
            }else{
                setTimeout(() => {
                    if (ids.length > 0) {
                        res.json({ status: 'ok', id: ids })
                    }else {
                        setTimeout(() => {
                            res.json({ status: 'ok', id: ids })
                        }, 1000);
                    }
                }, 500);
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

dates.post('/sendConfirmation/:id', (req, res) => {
    const id = req.params.id
    const data = {
        name: req.body.name,
        contact: req.body.contact,
        start: req.body.start,
        end: req.body.end,
        date: req.body.date,
        services: '',
        lender: req.body.lenders,
        payment: req.body.payment
    }

    for (let index = 0; index < req.body.service.length; index++) {
        const element = req.body.service[index].servicio;
        if (index > 0) {
            data.services = data.services + ' - ' + element
        } else {
            data.services = element
        }
    }
    const split = data.date.split('-')
    const mail = {
        from: "kkprettynails.cl",
        to: data.contact,
        subject: 'Confirmacion de cita programada',
        html: `
      <div style="width: 80%;max-width:1000px;margin:auto; padding:0;text-align:center;">
              <div style="width: 100%;height: 10vh;margin: auto;background-color: #181d81;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);padding: 10px;font-family: 'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#181d81;text-align:justify;-webkit-box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);-moz-box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);">
                  <div style="width: 80px;margin:auto;border-radius:55%;background-color:#fff;padding: 10px;">     
                      <img style="width: 100%;" src="${imgMails}syswa-isotipo.png" alt="Logo syswa">
                  </div>
              </div>
              <div style="width: 100%;margin: auto;padding-top: 5%;font-family: 'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#181d81;padding-bottom: 20px;padding-left:10px;">
                  <center>
                      <div style="width:100%;text-align: center;">
                          <h1 style="text-align: center;color:#181d81;">Bienvenid@ </h1>
                          <img style="height:80px;width:100px;margin-top:-20px;" src="${imgMails}logokk.png" alt="Logo kkprettynails">
                              <p style="text-align:center;margin-top:10px;font-size:16px;"> <strong>¡Hola ${data.name}! has generado la siguiente cita.</p>
                              
                              <p style="text-align:left;margin-top:10px;font-size:14px;font-weight: 300;"> 
                                  <strong> Profesional: </strong> ${data.lender}. <br>
                                  <strong> Servicios:</strong> ${data.services}. <br>
                                  <strong> Horarios de entrada:</strong> ${data.start}. <br>
                              </p>
                              <p style="text-align:left;margin-top:10px;font-size:16px;"> 
                               <img style="height:25px;width:25px;" src="${imgMails}calendar.png" alt="Logo kkprettynails"> 
                              <b style="margin-top:-5px">${split[1]}-${split[0]}-${split[2]}</b> <br>
                              <img style="height:25px;width:25px;" src="${imgMails}payment.png" alt="Logo kkprettynails"> 
                              <b style="margin-top:-5px">${data.payment}</b> <br>
                              <img style="height:25px;width:25px;" src="${imgMails}market.png" alt="Logo kkprettynails"><a style="text-align:center;font-size:16px;" href="https://goo.gl/maps/m5rVWDEiPj7q1Hxh9"><b style="font-family: 'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#181d81;font-size:16px;margin-top:-5px"> Av. Pedro de Valdivia 3474 Caracol Ñuñoa, Local 53-B Ñuñoa, Chile. </b></a>   <br>
                              </p>
                          <center style="margin-top:40px;margin-bottom:30px;">
                              <a style="background-color:#181d81;font-size:18px;border:none;border-radius:14px;padding:10px;margin-bottom:30px;color:#fff;cursor:pointer;" href="http://kkprettynails.syswa.net/#/ConfirmacionAgenda?id=${id}">Confirmar</a>
                          </center>
                          <hr style="border-top: 1.5px solid #ffd4d8;">
                          <p style="text-align:left;margin-top:10px;font-size:14px;font-weight: 300;"> 
                              <strong>Al visitar nuestro local ten presente: </strong> <br><br>
                              1. Llegar con 15 minutos de anticipación. <br>
                              2. Para evitar restrasos en los servicios, no se atenderá una vez pasado los 15 minutos de la hora agendada.
                          </p>
                  <div>
                  </center>
              </div>
              <div style="width: 100%;background-color: #f0f1f3;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);margin: auto;font-family: 'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#181d81;padding-bottom:8px;-webkit-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);-moz-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);">
                  <center>
                  <div style="width:100%;">
                      <center>
                      <p style="text-align:center;font-size:14px;"><strong> Contáctanos</strong></p>
                        <a  href="mailto:kkprettynails@gmail.com" style="margin-left:40px;text-decoration:none;"> 
                          <img style="width:4%;" src="${imgMails}mail.png" alt="Logo mail">
                        </a>
                        <a  href="https://www.instagram.com/kkprettynails/" style="margin-left:40px;text-decoration:none;">
                          <img style="width:4%;" src="${imgMails}ig.png" alt="Logo ig">
                        </a>
                        <a  href="https://api.whatsapp.com/send?phone=56972628949&text=&source=&data=&app_absent=" style="margin-left:20px;text-decoration:none;">
                          <img style="width:4%;" src="${imgMails}ws.png" alt="Logo ws">
                        </a>
                        <a  href="https://kkprettynails.cl" style="margin-left:40px;text-decoration:none;">
                          <img style="width:4%;" src="${imgMails}web.png" alt="Logo web">
                        </a>
                      <br>
                      <a style="text-align:center;font-size:14px;" href="https://goo.gl/maps/m5rVWDEiPj7q1Hxh9"> Av. Pedro de Valdivia 3474 Caracol Ñuñoa, Local 53-B Ñuñoa, Chile.</a>
                      </center>
                  </div>
                  </center>
              </div>
          </div>
      `
    }
    try {
        Mails.sendMail(mail)
        res.json({ status: 'ok' })
    } catch (err) {
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

dates.post('/endDate/:id', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    const Client = connect.useDb(database).model('clients', clientSchema)
    const EndingDates = connect.useDb(database).model('endingdates', endingDateSchema)
    const Dates = connect.useDb(database).model('dates', dateSchema)
    const id = req.params.id

    Dates.findById(id)
    .then(dateFind => {
        if (dateFind.process) {
            Client.findById(req.body.client.id)
            .then(client => {
                const data = {
                    services: req.body.service,
                    branch: req.body.branch,
                    client: req.body.client,
                    employe: req.body.employe,
                    microServices: req.body.microServices,
                    createdAt: new Date()
                }
                EndingDates.create(data)
                .then(closed => {
                    Dates.findByIdAndUpdate(id, { $set: { process: false } })
                    .then(end => {
                        res.json({ status: 'ok', token:req.requestToken })
                    })
                    .catch(err => {
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
                .catch(err => {
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
            .catch(err => {
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
        }else{
            res.json({ status: 'already end', token:req.requestToken })
        }
    })
    .catch(err => {
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

dates.post('/editdate', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Dates = connect.useDb(database).model('dates', dateSchema)
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const dataEdit = req.body.data

    try {
        const editDate = await Dates.findByIdAndUpdate(dataEdit._id, {
            $set: {
                start: dataEdit.date+ " "+dataEdit.start,
                end: dataEdit.date+ " "+dataEdit.end,
                split: dataEdit.employe.id,
                employe: dataEdit.employe, 
                duration: dataEdit.duration,
                class: dataEdit.employe.class,
                createdAt: dataEdit.date+ " 10:00"
            }
        })
        if (editDate) {
            try {
                const findBlocksToEditSameDay = await dateBlock.findById(dataEdit.idBlock)
                const blocks = findBlocksToEditSameDay.blocks
                blocks.forEach((block, index) => {
                    if (req.body.blocks[index + 1]) {
                        if (req.body.blocks[index].validator == 'select' && req.body.blocks[index + 1].validator == 'select') {
                            if (block.employes.length > 0) {
                                block.employes.forEach((element, index2) => {
                                    if (element.id == dataEdit.employe.id) {
                                        //bloquear
                                        block.employes.splice(index2, 1)
                                        block.employeBlocked.push({employe:dataEdit.employe.id, type: 'date'})
                                    }
                                });
                                if (block.employes.length > 0) {
                                    block.validator = true
                                }else {
                                    block.validator = false
                                }
                            }else{
                                block.validator = false
                            }
                        }else{
                            if (block.employes.length > 0) {
                                block.validator = true
                            }else{
                                block.validator = false
                            }
                        }
                    }
                });
                const findBlocks = await dateBlock.findByIdAndUpdate(dataEdit.idBlock, {
                    $set: {
                        blocks: blocks
                    }
                })

                try {
                    const findBlocksToEdit = await dateBlock.findOne({
                        $and: [
                            { 'dateData.branch': editDate.branch },
                            { 'dateData.date': editDate.start.split(" ")[0] }
                        ]
                    })
                    var valid = false
                    const startBefore = editDate.start.split(' ')[1]
                    const endBefore = editDate.end.split(' ')[1]
                    var diff = false
                    if (dataEdit.date != editDate.start.split(' ')[0]) {
                        diff = true
                    }
                    if (dataEdit.employe.id != editDate.employe.id) {
                        diff = true
                    }
                    for (const key in findBlocksToEdit.blocks) {
                        const blockEdit = findBlocksToEdit.blocks[key]
                        if (blockEdit.hour == startBefore) {
                            valid = true
                        }
                        if (blockEdit.hour == endBefore) {
                            valid = false
                            break
                        }
                        if (valid) {
                            if(diff){
                                blockEdit.employeBlocked.forEach((element, index) => {
                                    if (element.employe == editDate.employe.id) {
                                        blockEdit.employeBlocked.splice(index, 1)
                                        blockEdit.employes.push({
                                            name: editDate.employe.name,
                                            id: editDate.employe.id,
                                            class: editDate.employe.class,
                                            position: 20,
                                            valid: false,
                                            img: editDate.employe.img
                                        })
                                    }
                                });
                            }else{
                                if(req.body.blocks[key].validator != 'select'){
                                    blockEdit.employeBlocked.forEach((element, index) => {
                                        if (element.employe == editDate.employe.id) {
                                            blockEdit.employeBlocked.splice(index, 1)
                                            blockEdit.employes.push({
                                                name: editDate.employe.name,
                                                id: editDate.employe.id,
                                                class: editDate.employe.class,
                                                position: 20,
                                                valid: false,
                                                img: editDate.employe.img
                                            })
                                        }
                                    });
                                }else if (dataEdit.end == blockEdit.hour) {
                                    blockEdit.employeBlocked.forEach((element, index) => {
                                        if (element.employe == editDate.employe.id) {
                                            blockEdit.employeBlocked.splice(index, 1)
                                            blockEdit.employes.push({
                                                name: editDate.employe.name,
                                                id: editDate.employe.id,
                                                class: editDate.employe.class,
                                                position: 20,
                                                valid: false,
                                                img: editDate.employe.img
                                            })
                                        }
                                    });
                                }
                            }
                        }
                    }
                    try {
                        const EditBlocks = await dateBlock.findByIdAndUpdate(findBlocksToEdit._id, {
                            $set: {
                                blocks: findBlocksToEdit.blocks
                            }
                        })
                        if (findBlocks) {
                            res.json({ status: 'ok', data:findBlocks, token:req.requestToken })
                        }
                    }catch (err) {
                        const Log = new LogService(
                            req.headers.host, 
                            req.body, 
                            req.params, 
                            err, 
                            req.requestToken, 
                            req.headers['x-database-connect'], 
                            req.route
                        )
                        const dataLog = await Log.createLog()
                        res.send('failed api with error, '+ dataLog.error)
                    }
                }catch (err) {
                    const Log = new LogService(
                        req.headers.host, 
                        req.body, 
                        req.params, 
                        err, 
                        req.requestToken, 
                        req.headers['x-database-connect'], 
                        req.route
                    )
                    const dataLog = await Log.createLog()
                    res.send('failed api with error, '+ dataLog.error)
                }
            }catch (err) {
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                const dataLog = await Log.createLog()
                res.send('failed api with error, '+ dataLog.error)
            }
        }
    }catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

dates.post('/editDataDate', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Dates = connect.useDb(database).model('dates', dateSchema)

    try {
        const editDate = await Dates.findByIdAndUpdate(req.body.id, {
            $set: {
                "client.location": req.body.location,
                "extraData.linkPhotos": req.body.link,
                "extraData.details": req.body.details,
                "extraData.phase": req.body.phase,
                "extraData.material": req.body.material,
                "extraData.nature": req.body.nature
            }
        })
        if(editDate){
            res.json({status:"ok"})
        }
    }catch(err){
        console.log(err)
    }
})

dates.post('/fixblocks', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const dateFix = req.body.date
    const start = req.body.start
    const end = req.body.end
    const employe = req.body.employe
    const branch = req.body.branch
    try {
        const findBlock = await dateBlock.findOne({
            $and: [
                { 'dateData.date': dateFix },
                { 'dateData.branch': branch }
            ]
        })
        if (findBlock) {
            var valid = false
            findBlock.blocks.forEach((block, index) => {
                if (block.hour == start) {
                    valid = true
                }
                if (block.hour == end) {
                    valid = false
                }
                if (valid) {
                    findBlock.blocks[index].employes.push(employe)
                    block.employeBlocked.forEach((element, indexTwo) => {
                        if (element.employe == employe.id) {
                            block.employeBlocked.splice(indexTwo, 1)
                        }
                    });
                }
            });
            try {
                const findBlocks = await dateBlock.findByIdAndUpdate(findBlock._id, {
                    $set: {
                        blocks: findBlock.blocks
                    }
                })
                if (findBlocks) {
                    res.json({ status: 'ok', data:findBlocks })
                }
            } catch (err) {
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                const dataLog = await Log.createLog()
                res.send('failed api with error, '+ dataLog.error)
            }
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

dates.post('/fixblocksinsert', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const dateFix = req.body.date
    const start = req.body.start
    const end = req.body.end
    const employe = req.body.employe
    const branch = req.body.branch
    try {
        const findBlock = await dateBlock.findOne({
            $and: [
                { 'dateData.date': dateFix },
                { 'dateData.branch': branch }
            ]
        })
        if (findBlock) {
            var valid = false
            findBlock.blocks.forEach((block, index) => {
                if (block.hour == start) {
                    valid = true
                }
                if (block.hour == end) {
                    valid = false
                }
                if (valid) {
                    findBlock.blocks[index].employeBlocked.push({
                        "employe": employe.id,
                        "type": "date"
                    })
                    block.employes.forEach((element, indexTwo) => {
                        if (element.id == employe.id) {
                            block.employes.splice(indexTwo, 1)
                        }
                    });
                }
            });
            try {
                const findBlocks = await dateBlock.findByIdAndUpdate(findBlock._id, {
                    $set: {
                        blocks: findBlock.blocks
                    }
                })
                if (findBlocks) {
                    res.json({ status: 'ok', data:findBlocks })
                }
            } catch (err) {
                const Log = new LogService(
                    req.headers.host, 
                    req.body, 
                    req.params, 
                    err, 
                    req.requestToken, 
                    req.headers['x-database-connect'], 
                    req.route
                )
                const dataLog = await Log.createLog()
                res.send('failed api with error, '+ dataLog.error)
            }
        }
    } catch (err) {
        const Log = new LogService(
            req.headers.host, 
            req.body, 
            req.params, 
            err, 
            req.requestToken, 
            req.headers['x-database-connect'], 
            req.route
        )
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})


module.exports = dates