const express = require('express')
const dates = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const dateSchema = require('../models/dates')
const employeSchema = require('../models/Employes')
const datesBlockSchema = require('../models/datesBlocks')
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

    const date = conn.model('dates', dateSchema)
    try {
        const getDates = await date.find()
        if (getDates.length > 0) {
            res.json({status: 'ok', data: getDates, token: req.requestToken})
        }else{
            res.json({status: 'nothing to found', data: getDates, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Datos de las citas) -- Api end (Return: dates´s data)

//----------------------------------------------------------------------------------

//Api que busca las citas de un prestador (Ingreso: ObjectId del empleado) -- Api that search dates by an employe (Input: Employe's ObjectId)

dates.get('/getDatesbyemploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)
    try{
        const find = await date.find({'employe.id':req.params.id})
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

//Api que busca las citas de un prestador (Ingreso: ObjectId del empleado) -- Api that search dates by an employe (Input: Employe's ObjectId)

dates.post('/availableslenders', (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)
    const Employe = conn.model('employes', employeSchema)
    console.log(req.body.date)
    const dateNow = new Date(req.body.date)
    const day = dateNow.getDay()
    const formatdate = dateNow.getFullYear() +"-"+(dateNow.getMonth() + 1)+"-"+dateNow.getDate()
    dateNow.setDate(dateNow.getDate() + 1)
    const formatdateTwo = dateNow.getFullYear() +"-"+(dateNow.getMonth() + 1)+"-"+dateNow.getDate()
    var arrayLenders = []
    date.find({
        $and: [
            {createdAt: {$gte: formatdate, $lte: formatdateTwo}},
            {branch: req.body.branch}
        ]
    }).sort({sort: 1})
    .then(citas => {
        console.log(citas)
        const dates = citas
        Employe.find({branch: req.body.branch})
        .then(lenders => {
            const Lenders = lenders
            for (let index = 0; index < Lenders.length; index++) {
                const element = Lenders[index];
                var valid = false
                var restTime = ''
                for (let index = 0; index < element.days.length; index++) {
                    const elementFour = element.days[index];
                    if (elementFour.day == day) {
                        valid = true
                        restTime = elementFour.hours[0]+'/'+elementFour.hours[1]
                    }
                }
                    if (valid) {
                    arrayLenders.push({name: element.firstName +' '+element.lastName, id: element._id, sort: 0, commission: element.commission, restTime: restTime})
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
                console.log(arrayLenders)
                arrayLenders.sort((a, b) => {
                    return a.comission - b.comission;
                });
                arrayLenders.sort((a, b) => {
                    return a.sort - b.sort;
                });
                res.json({array: arrayLenders, day: day})
            }else{
                arrayLenders.sort((a, b) => {
                    return a.comission - b.comission;
                });
                res.json({array: arrayLenders, day: day})
            }
        })
        .catch(err => {
            res.send(err)
        })
    }).catch(err => {
        console.log(err)
        res.send(err)
    })
})

//Fin de la api (Retorna: Datos de las citas del empleado) -- Api end (Return: Employe dates´s data)

//----------------------------------------------------------------------------------

//Api que crea una nueva cita (Ingreso: branch, start, end, date, sort, services, client:{id, name, email, phone, historical}, origin, employe:{id, name, document, class}, typePay) -- Api that register a new Date (Input: branch, start, end, date, sort, services:[], client:{id, name, email, phone, historical}, origin, employe:{id, name, document, class}, typePay)

dates.post('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)

    try{
        const inspector = await date.findOne({
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
            const registerdate = await date.create(dateData)
            if (registerdate) {
                res.json({status: 'date created', data: registerdate})
            }
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Datos de la cita) -- Api end (Return: date´s data)

// -----------------------------------------------------------------------------

//Api que elimina una cita (Ingreso: ObejctId de la cita) -- Api that delete a date (Input: date´s ObjectId)

dates.delete('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)

    try{
        const deletedate = await date.findByIdAndRemove(req.params.id)
        if (deletedate) {
            res.json({status:'deleted', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Respuesta simple) -- Api end (Return: Simple response)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horario de un empleado (Ingreso: date, restHour, timedate, branch, employe) -- api that find and create an employe´s time block (Input: date, restHour, timedate, branch, employe)

dates.post('/blockHours', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const dateBlock = conn.model('datesblocks', datesBlockSchema)
    const Configuration = conn.model('configurations', configurationSchema)
    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()

    const restHour = req.body.restHour
    const hoursdate = req.body.timedate
    try {
        const findDay = await dateBlock.findOne({
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
                            if (element.validator == false && initialBlock[e-1].validator == true && e > 0) {
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

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, branch, employes, employesServices) -- api that find and create first time blocks (Input: date, timedate, branch, employes, employesServices)

dates.post('/editBlocksFirst', async (req, res) => {
    const hoursdate = req.body.timedate
    const blocks = req.body.block

    if (req.body.firstBlock) {
        const employesServices = req.body.employesServices
        for (const i in employesServices) {
            const element = employesServices[i];
            for (const u in blocks) {
                const elementTwo = blocks[u];
                for (let o = 0; o < elementTwo.employes.length; o++) {
                    const elementThree = elementTwo.employes[o];
                    if (element.id == elementThree.id) {
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
                        if(elementTwo.valid){
                            element.validator = true
                            break
                        }
                    }
                }else{
                    element.validator = false
                }
            }
        }
    
        for (let e = 0; e < blocks.length; e++) {
            const element = blocks[e];
            if (blocks[e-1]) {
                if (element.validator == false && blocks[e-1].validator == true && e > 0) {
                    for (let u = 1; u < hoursdate / 15 + 1; u++) {
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
        res.json({status: 'ok', data: blocks})
    }else{
        const employeSelect = req.body.employeSelect
        const blockEmploye = []
        for (const block of blocks) {
            var valid = false
            for (const employe of block.employes) {
                if (employe.id == employeSelect) {
                    blockEmploye.push({hour: block.hour, validator: true})
                    valid = true
                    break
                }
            }
            if (!valid) {
                blockEmploye.push({hour: block.hour, validator: false})
            }
        }

        for (let e = 0; e < blockEmploye.length; e++) {
            const element = blockEmploye[e];
            if (blockEmploye[e-1]) {
                if (element.validator == false && blockEmploye[e-1].validator == true && e > 0) {
                    for (let u = 1; u < hoursdate / 15 + 1; u++) {
                        if (blockEmploye[e - u]) {
                            blockEmploye[e - u].validator = 'unavailable'
                        }
                    }
                }
                if (blockEmploye.length - 1 == e) {
                    for (let u = 0; u < hoursdate / 15; u++) {
                        if (blockEmploye[e - u]) {
                            blockEmploye[e - u].validator = 'unavailable'
                        }
                    }
                }
            }
        }
        res.json({status: 'ok', data: blocks, blockEmploye: blockEmploye})
    }

    
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, branch, employes, employesServices) -- api that find and create first time blocks (Input: date, timedate, branch, employes, employesServices)

dates.post('/blocksHoursFirst', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const dateBlock = conn.model('datesblocks', datesBlockSchema)
    const Configuration = conn.model('configurations', configurationSchema)
    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()
    const hoursdate = req.body.timedate
    const employes = req.body.employes
    const employesServices = req.body.employesServices
    try {
        const finddate = await dateBlock.findOne({
            $and: [ 
                {'dateData.branch': req.body.branch},
                {'dateData.date': dateDaily}
            ]
        })
        if (finddate) {
            const blocksFirst = finddate.blocks
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
                        if (employeBlock.id  == employeService.id) {
                            valid = true
                        }
                    }
                    if (valid == false && blocksFirst[e-1]) {
                        for (let u = 1; u <= hoursdate / 15; u++) {
                            if (blocksFirst[e - u]) {
                                for (let r = 0; r < blocksFirst[e - u].employes.length; r++) {
                                    if (blocksFirst[e - u].employes[r].id  == employeService.id) {
                                        blocksFirst[e - u].employes[r].valid = false
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // res.json({status: 'ok', data: blocksFirst})
            for (let e = 0; e < blocksFirst.length; e++) {
                const element = blocksFirst[e];
                if (blocksFirst[e-1]) {
                    if (element.validator == false && blocksFirst[e-1].validator == true && e > 0) {
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

            res.json({status: 'ok', data: blocksFirst})
        }else{
            try {
                const findConfiguration = await Configuration.findOne({branch: req.body.branch})
                const getDay = findConfiguration.blockHour.filter(day => day.day == Day)[0]
                console.log(getDay)
                var blocksFirst = []
                var splitHour = parseFloat(getDay.start.split(':')[0])
                var splitMinutes = getDay.start.split(':')[1]
                for (let i = 0; i < getDay.time / 15 + 1; i++) {
                    if (i == 0) {
                        blocksFirst.push({
                            hour: getDay.start,
                            validator: true,
                            employes: []
                        })
                        splitMinutes = parseFloat(splitMinutes) + 15
                        splitHour = splitMinutes == 60 ? splitHour + 1 : splitHour
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                    }else{
                        blocksFirst.push({
                            hour: splitHour+':'+splitMinutes,
                            validator: true,
                            employes: []
                        })
                        splitMinutes = parseFloat(splitMinutes) + 15
                        splitHour = splitMinutes == 60 ? splitHour + 1 : splitHour
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                    }
                }
                console.log(blocksFirst)
                for (let i = 0; i < employes.length; i++) {
                    const element = employes[i];
                    const restInit = element.restTime.split('/')[0]
                    const restEnd = element.restTime.split('/')[1]
                    var inspector = false
                    var hourInit = restInit.split(':')[0]+restInit.split(':')[1]
                    for (let u = 0; u < blocksFirst.length; u++) {
                        const elementTwo = blocksFirst[u];
                        var hour = elementTwo.hour.split(':')[0]+elementTwo.hour.split(':')[1]
                        if (parseFloat(hourInit) < parseFloat(hour)) {
                            inspector = true
                            if (restEnd == elementTwo.hour) {
                                inspector = false
                                hourInit = 15432154451
                            }
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
                                    if (employeBlock.id  == employeService.id) {
                                        valid = true
                                    }
                                }
                                if (valid == false && blocksFirst[e-1]) {
                                    for (let u = 1; u <= hoursdate / 15; u++) {
                                        if (blocksFirst[e - u]) {
                                            for (let r = 0; r < blocksFirst[e - u].employes.length; r++) {
                                                if (blocksFirst[e - u].employes[r].id  == employeService.id) {
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
                            if (element.validator == false && blocksFirst[e-1].validator == true && e > 0) {
                                for (let u = 1; u < hoursdate / 15 + 1; u++) {
                                    if (blocksFirst[e - u]) {
                                        blocksFirst[e - u].validator = 'unavailable'
                                    }
                                }
                            }
                            if (blocksFirst.length - 1 == e) {
                                for (let u = 0; u < hoursdate / 15; u++) {
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

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, hour, branch, employe) -- api that find and create first time blocks (Input: date, timedate, hour, branch, employe)

dates.post('/selectdatesBlocksFirst', async (req, res) => {
    const hoursdate = req.body.timedate
    const hourSelect = req.body.hour
    const employe = req.body.employe
    const block = req.body.block

    if(req.body.firstBlock){
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
                for (let u = 0; u < hoursdate / 15; u++) {
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
        
        var end = ''
        for (let i = 0; i < block.length; i++) {
            const element = block[i];
            if (element.hour == hourSelect) {
                for (let u = 0; u <= hoursdate / 15; u++) {
                    block[i + u].validator = 'select'
                    if (u == hoursdate / 15) {
                        end = block[i + u].hour
                    }
                }
            }
        }
    
        res.json({status: 'ok', data: block, end: end})
    }else{

        //algoritmo para bloques por empleado
    }
    
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, hour, branch, employe) -- api that find and create first time blocks (Input: date, timedate, hour, branch, employe)

dates.post('/selectdatesBlocks', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    
    const dateBlock = conn.model('datesblocks', datesBlockSchema)
    const Configuration = conn.model('configurations', configurationSchema)

    const dateDaily = req.body.date
    const Day = new Date(dateDaily).getDay()
    const hoursdate = req.body.timedate
    const hourSelect = req.body.hour
    const employe = req.body.employe
    const block = req.body.block

    try{
        const finddate = await dateBlock.findOne({
            $and: [ 
                {'dateData.branch': req.body.branch},
                {'dateData.date': dateDaily}
            ]
        })
        if (finddate) {
            // cambiar employeBlocks a hash table
            const findEmploye = finddate.employeBlocks.find(element => element.employe == employe)
            const findIndex = finddate.employeBlocks.findIndex(findEmploye)
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
                    for (let u = 1; u < hoursdate / 15 - 2; u++) {
                        block[i + u].validator = false
                    }
                }
            }
            try{
                const blockEdit = await dateBlock.findByIdAndUpdate(finddate._id, {
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
                        for (let u = 0; u <= hoursdate / 15; u++) {
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

//-----------------------------------------------------------------------------

//Api que verifica si no se esta repitiendo una cita () -- Api that verify if a date is not repiting (Input: )

dates.post('/verifydate', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)

    const datadate = req.body.datadate
    const datee = req.body.date
    const dateNow = new Date(datee+' 1:00')
    const formatdate = dateNow.getFullYear() +"-"+(dateNow.getMonth() + 1)+"-"+dateNow.getDate()
    dateNow.setDate(dateNow.getDate() + 1)
    const formatdateTwo = dateNow.getFullYear() +"-"+(dateNow.getMonth() + 1)+"-"+dateNow.getDate()
    try{
        const finddate = await Citas.find({$and:[{date: {$gte: formatdate, $lte: formatdateTwo}}]}).sort({sort:1})
        if (finddate.length > 0) {
            for (let i = 0; i < datadate.serviceSelectds.length; i++) {
                var validFinally = false
                const element = datadate.serviceSelectds[i];
                const datesData = []
                for (let o = 0; o < dates.length; o++) {
                    const filter = dates[o];
                    if (filter.employe == element.realEmploye) {
                        datesData.push(filter)
                    }
                }
                for (let r = 0; r < datesData.length; r++) {
                    const elementTwo = datesData[r];
                    var splitOne = elementTwo.start.split(':')
                    var splitTwo = elementTwo.end.split(':')
                    var SumHours  = ((parseFloat(splitTwo[0]) - parseFloat(splitOne[0])) * 60)
                    var SumMinutes = parseFloat(splitTwo[1]) - parseFloat(splitOne[1])
                    var TotalMinutes = SumHours + SumMinutes
                    const totalFor = TotalMinutes / 15
                    var input, output
                    var minutes = parseInt(splitOne[1])
                    var hours = parseInt(splitOne[0])
                    var blockdate = []
                    for (let index = 0; index <= totalFor - 1; index++) {
                        if (minutes == 0) {
                            minutes = "00"
                        }
                        output = hours+":"+minutes
                        if(index > 0){
                            blockdate.push(output)
                        }
                        minutes = parseInt(minutes) + 15
                        if (minutes == 60) {
                            hours++
                            minutes = "00"
                        }
                    }
                    var valid = false
                    for (let j = 0; j < element.blocks.length; j++) {
                        const elementBlocks = element.blocks[j];
                        if (elementBlocks.validator == 'select') {
                            for (let l = 0; l < blockdate.length; l++) {
                                const elementBlockdate = blockdate[l];
                                if (elementBlockdate == elementBlocks.Horario) {
                                    valid = true
                                    break
                                }
                            }
                        }
                    }
                    if (valid) {
                        validFinally = true
                        break
                    }
                }
                if (validFinally) {
                    break
                }
            }
            res.json({status: validFinally})
        }else{
            res.json({status: false})
        }
    }catch(err){res.send(err)}
})

//Fin de la api (Retorna: status)  -- Api end (Return: status)

module.exports = dates