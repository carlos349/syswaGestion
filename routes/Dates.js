const express = require('express')
const dates = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const dateSchema = require('../models/Dates')
const datesBlockSchema = require('../models/DatesBlocks')
const configurationSchema = require('../models/Configurations')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
const cors = require('cors')

dates.use(cors())

// Api que busca toda la informacion de las citas (Ingreso: Nullo) -- Api that search all the dates' data (Input: Null)

dates.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Date = conn.model('dates', dateSchema)
    try {
        const getDates = await Date.find()
        if (getDates.length > 0) {
            res.json({status: 'ok', data: getDates, token: req.requestToken})
        }else{
            res.json({status: 'nothing to found', data: getDates, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Datos de las citas) -- Api end (Return: Dates´s data)

//----------------------------------------------------------------------------------

//Api que busca las citas de un prestador (Ingreso: ObjectId del empleado) -- Api that search dates by an employe (Input: Employe's ObjectId)

dates.get('/getdatesbyemploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Date = conn.model('dates', dateSchema)
    try{
        const find = await Date.find({'employe.id':req.params.id})
        if (find.length > 0) {
            res.json({status:'ok', data: find, token: req.requestToken})
        }else{
            res.json({status: 'nothing found', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Datos de las citas del empleado) -- Api end (Return: Employe dates´s data)

//----------------------------------------------------------------------------------

//Api que crea una nueva cita (Ingreso: branch, start, end, date, sort, services, client:{id, name, email, phone, historical}, origin, employe:{id, name, document, class}, typePay) -- Api that register a new date (Input: branch, start, end, date, sort, services:[], client:{id, name, email, phone, historical}, origin, employe:{id, name, document, class}, typePay)

dates.post('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Date = conn.model('dates', dateSchema)

    try{
        const inspector = await Date.findOne({
            $and:[
                {
                    'client.id': req.body.client.id,
                    'employe.id': req.body.employe.id,
                    createdAt: req.body.date,
                    branch: req.body.branch,
                    start: req.body.start,
                    end: req.body.end
                }
            ]
        })
        if (inspector) {
            res.json({status:'date repeated'})
        }else{
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
                typeCreation:'',
                payPdf: '',
                imgDesign: [],
                origin: req.body.origin
            }
            const registerDate = await Date.create(dateData)
            if (registerDate) {
                res.json({status: 'Date created', data: registerDate})
            }
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Datos de la cita) -- Api end (Return: Date´s data)

// -----------------------------------------------------------------------------

//Api que elimina una cita (Ingreso: ObejctId de la cita) -- Api that delete a date (Input: Date´s ObjectId)

dates.delete('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Date = conn.model('dates', dateSchema)

    try{
        const deleteDate = await Date.findByIdAndRemove(req.params.id)
        if (deleteDate) {
            res.json({status:'deleted', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Respuesta simple) -- Api end (Return: Simple response)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horario de un empleado (Ingreso: date, restHour, timeDate, branch, employe) -- api that find and create an employe´s time block (Input: date, restHour, timeDate, branch, employe)

dates.post('/blockHours', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const DateBlock = conn.model('datesblocks', datesBlockSchema)
    const Configuration = conn.model('configurations', configurationSchema)
    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()

    const restHour = req.body.restHour
    const hoursDate = req.body.timeDate
    try {
        const findDay = await DateBlock.findOne({
            $and: [
                {'dateData.branch': req.body.branch},
                {'dateData.date': dateDaily}
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
                    if (element.validator == false && blocks[e-1].validator == true && e > 0) {
                        for (let u = 0; u < hoursDate / 15; u++) {
                            if (blocks[e - u]) {
                                blocks[e - u].validator = 'unavailable'
                            }
                        }
                    }
                    if (blocks.length - 1 == e) {
                        for (let u = 0; u < hoursDate / 15; u++) {
                            blocks[e - u].validator = 'unavailable'
                        }
                    }
                }
                res.json({status: 'ok', data: blocks})
            }else{
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
                        }else{
                            initialBlock.push({
                                hour: splitHour+':'+splitMinutes,
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
                                initialBlock[e+u].validator = false
                            }
                        }
                    }
                    try {
                        const findDay = await DateBlock.findByIdAndUpdate(findDay._id, {
                            $push: {
                                employeBlocks: {
                                    employe: req.body.employe,
                                    block: initialBlock
                                }
                            }
                        })
                        for (let e = 0; e < initialBlock.length; e++) {
                            const element = initialBlock[e];
                            if (element.validator == false && initialBlock[e-1].validator == true && e > 0) {
                                for (let u = 0; u < hoursDate / 15; u++) {
                                    if (initialBlock[e - u]) {
                                        initialBlock[e - u].validator = 'unavailable'
                                    }
                                }
                            }
                            if (initialBlock.length - 1 == e) {
                                for (let u = 0; u < hoursDate / 15; u++) {
                                    initialBlock[e - u].validator = 'unavailable'
                                }
                            }
                        }
                        res.json({status: 'ok', data: initialBlock})
                    }catch(err){res.send(err)}
                }catch(err){res.send(err)}
            }
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timeDate, branch, employes, employesServices) -- api that find and create first time blocks (Input: date, timeDate, branch, employes, employesServices)

dates.post('/blocksHoursFirst', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const DateBlock = conn.model('datesblocks', datesBlockSchema)
    const Configuration = conn.model('configurations', configurationSchema)
    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()
    const hoursDate = req.body.timeDate
    const employes = req.body.employes
    const employesServices = req.body.employesServices
    try {
        const findDate = await DateBlock.findOne({
            $and: [ 
                {'dateData.branch': req.body.branch},
                {'dateData.date': dateDaily}
            ]
        })
        if (findDate) {
            const blocksFirst = findDate.firstBlock
            for (let i = 0; i < employesServices.length; i++) {
                const element = employesServices[i];
                for (let u = 0; u < blocksFirst.length; u++) {
                    const elementTwo = blocksFirst[u];
                    for (let o = 0; o < elementTwo.employes.length; o++) {
                        const elementThree = array[o];
                        if (element.id == elementThree.id) {
                            elementThree.valid = true
                        }
                    }
                }
            }
            for (let e = 0; e < blocksFirst.length; e++) {
                const element = blocksFirst[e];
                if (element.validator == false && blocksFirst[e-1].validator == true && e > 0) {
                    for (let u = 0; u < hoursDate / 15; u++) {
                        if (blocksFirst[e - u]) {
                            blocksFirst[e - u].validator = 'unavailable'
                        }
                    }
                }
                if (blocksFirst.length - 1 == e) {
                    for (let u = 0; u < hoursDate / 15; u++) {
                        blocksFirst[e - u].validator = 'unavailable'
                    }
                }
            }
            res.json({status: 'ok', data: blocksFirst})
        }else{
            try {
                const findConfiguration = await Configuration.findOne({branch: req.body.branch})
                const getDay = findConfiguration.blockHour.filter(day => day.day == Day)
                var blocksFirst = []
                var splitHour = getDay.start.split(':')[0]
                var splitMinutes = getDay.start.split(':')[1]
                for (let i = 0; i < getDay.time / 15; i++) {
                    for (let i = 0; i < getDay.time / 15; i++) {
                        if (i == 0) {
                            blocksFirst.push({
                                hour: getDay.start,
                                validator: true,
                                employes: []
                            })
                            splitMinutes = parseFloat(splitMinutes + 15)
                            splitHour = splitMinutes == 60 ? splitHour++ : splitHour
                            splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                        }else{
                            blocksFirst.push({
                                hour: splitHour+':'+splitMinutes,
                                validator: true,
                                employes: []
                            })
                            splitMinutes = parseFloat(splitMinutes + 15)
                            splitHour = splitMinutes == 60 ? splitHour++ : splitHour
                            splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                        }
                    }
                }
                for (let i = 0; i < employes.length; i++) {
                    const element = employes[i];
                    const restInit = element.restTime.split('/')[0]
                    const restEnd = element.restTime.split('/')[1]
                    var inspector = false
                    for (let u = 0; u < blocksFirst.length; u++) {
                        const elementTwo = blocksFirst[u];
                        if (restInit > elementTwo.hour) {
                            inspector = true
                        }else if (restEnd == elementTwo.hour) {
                            inspector = false
                        }
                        if(!inspector){
                            elementTwo.employes.push({name: element.name, id: element.id, position: i, valid: false})
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
                        date: req.body.date
                    },
                    employeBlocks: [],
                    firstBlock: blocksFirst
                }
                try {
                    const createBlockDate = await DateBlock.create(dataConfiguration)
                    if (createBlockDate) {
                        for (let i = 0; i < employesServices.length; i++) {
                            const element = employesServices[i];
                            for (let u = 0; u < blocksFirst.length; u++) {
                                const elementTwo = blocksFirst[u];
                                for (let o = 0; o < elementTwo.employes.length; o++) {
                                    const elementThree = array[o];
                                    if (element.id == elementThree.id) {
                                        elementThree.valid = true
                                    }
                                }
                            }
                        }
                        for (let e = 0; e < blocksFirst.length; e++) {
                            const element = blocksFirst[e];
                            if (element.validator == false && blocksFirst[e-1].validator == true && e > 0) {
                                for (let u = 0; u < hoursDate / 15; u++) {
                                    if (blocksFirst[e - u]) {
                                        blocksFirst[e - u].validator = 'unavailable'
                                    }
                                }
                            }
                            if (blocksFirst.length - 1 == e) {
                                for (let u = 0; u < hoursDate / 15; u++) {
                                    blocksFirst[e - u].validator = 'unavailable'
                                }
                            }
                        }
                        res.json({status: 'ok', data: blocksFirst})
                    }
                }catch(err){res.send(err)}
            }catch(err){res.send(err)}
        }
    }catch(err){res.send(err)}
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timeDate, hour, branch, employe) -- api that find and create first time blocks (Input: date, timeDate, hour, branch, employe)

dates.post('/selectDatesBlocksFirst', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const DateBlock = conn.model('datesblocks', datesBlockSchema)
    const Configuration = conn.model('configurations', configurationSchema)

    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()
    const hoursDate = req.body.timeDate
    const hourSelect = req.body.hour
    const employe = req.body.employe
    const block = req.body.block
    try {
        const findDate = await DateBlock.findOne({
            $and: [ 
                {'dateData.branch': req.body.branch},
                {'dateData.date': dateDaily}
            ]
        })
        if (findDate) {
            if (!req.body.ifFirstClick) {
                for (let i = 0; i < block.length; i++) {
                    const element = block[i];
                    if (element.validator == 'select') {
                        element.validator = true
                        block[i].employes.unshift(employe)
                    }
                }
            }
            for (let i = 0; i < block.length; i++) {
                const element = block[i];
                if (element.hour == hourSelect) {
                    for (let u = 1; u < hoursDate / 15 - 2; u++) {
                        for (let e = 0; e < block[i + u].employes.length; e++) {
                            if (block[i + u].employes[e].id == employe) {
                                block[i + u].employes.splice(e, 1)
                            }
                        }
                        if (block[i + u].employes.length == 0) {
                            block[i + u].validator = false
                        }
                    }
                }
            }
            try {
                const editBlock = await DateBlock.findByIdAndUpdate(findDate._id, {
                    $set: {
                        firstBlock: block
                    }
                })
                for (let i = 0; i < block.length; i++) {
                    const element = block[i];
                    if (element.hour == hourSelect) {
                        for (let u = 0; u < hoursDate / 15; u++) {
                            block[i + u].validator = 'select'
                        }
                    }
                }
                res.json({status: 'ok', data: block})
            }catch(err){res.send(err)}
        }
    }catch(err){res.send(err)}
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timeDate, hour, branch, employe) -- api that find and create first time blocks (Input: date, timeDate, hour, branch, employe)

dates.post('/selectDatesBlocksFirst', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const DateBlock = conn.model('datesblocks', datesBlockSchema)
    const Configuration = conn.model('configurations', configurationSchema)

    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()
    const hoursDate = req.body.timeDate
    const hourSelect = req.body.hour
    const employe = req.body.employe
    const block = req.body.block

    try{
        const findDate = await DateBlock.findOne({
            $and: [ 
                {'dateData.branch': req.body.branch},
                {'dateData.date': dateDaily}
            ]
        })
        if (findDate) {
            const findEmploye = findDate.employeBlocks.find(element => element.employe == employe)
            const findIndex = findDate.employeBlocks.findIndex(findEmploye)
            if (!req.body.ifFirstClick) {
                for (let i = 0; i < block.length; i++) {
                    const element = block[i];
                    if (element.validator == 'select') {
                        element.validator = true
                    }
                }
            }
            for (let i = 0; i < block.length; i++) {
                const element = block[i];
                if (element.hour == hourSelect) {
                    for (let u = 1; u < hoursDate / 15 - 2; u++) {
                        block[i + u].validator = false
                    }
                }
            }
            try{
                const blockEdit = await DateBlock.findByIdAndUpdate(findDate._id, {
                    $splice: [
                        employeBlocks, 
                        findIndex, 
                        1
                    ],
                    $push: {
                        employeBlocks: findEmploye
                    }
                })
                for (let i = 0; i < block.length; i++) {
                    const element = block[i];
                    if (element.hour == hourSelect) {
                        for (let u = 0; u < hoursDate / 15; u++) {
                            block[i + u].validator = 'select'
                        }
                    }
                }
                res.json({status: 'ok', data: block})
            }catch(err){res.send(err)}
        }
    }catch(err){res.send(err)}
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

module.exports = dates