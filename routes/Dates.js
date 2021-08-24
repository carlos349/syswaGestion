const express = require('express')
const dates = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const dateSchema = require('../models/dates')
const dateBlockingSchema = require('../models/DateBlocking')
const employeSchema = require('../models/Employes')
const clientSchema = require('../models/Clients')
const endingDateSchema = require('../models/EndingDates')
const userSchema = require('../models/Users')
const datesBlockSchema = require('../models/datesBlocks')
const configurationSchema = require('../models/Configurations')
const uploadS3 = require('../common-midleware/index')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
const formats = require('../formats')
const cors = require('cors')


dates.use(cors())

// Api que busca toda la informacion de las citas (Ingreso: Nullo) -- Api that search all the dates' data (Input: Null)

dates.get('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)
    try {
        const getDates = await date.find({
            branch: req.params.branch
        })
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

//Fin de la api (Retorna: Datos de las citas) -- Api end (Return: dates´s data)

//----------------------------------------------------------------------------------

//Api que busca las citas de un prestador (Ingreso: ObjectId del empleado) -- Api that search dates by an employe (Input: Employe's ObjectId)

dates.get('/getEndingDates/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const EndingDates = conn.model('endingdates', endingDateSchema)

    try{
        const find = await EndingDates.find({branch: req.params.branch})
        if (find.length > 0) {
            res.json({status:'ok', data: find, token: req.requestToken})
        }else{
            res.json({status: 'nothing found', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Datos de las horas bloqueadas) -- Api end (Return: hours blocking data)

//----------------------------------------------------------------------------------

//Api de la api (Retorna: Datos de las horas bloqueadas) llega (branch como parametro) -- Api end (Return: hours blocking data) input (branch as param)

dates.get('/getBlockingHours/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const HourBlocking = conn.model('hoursblocking', dateBlockingSchema)

    try{
        const find = await HourBlocking.find({branch: req.params.branch})
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
    const User = conn.model('users', userSchema)

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
    .then(dates => {
        Employe.find({branch: req.body.branch})
        .then(lenders => {
            User.populate(lenders, {path: "users"})
            .then(EmployeUserData => {
                const Lenders = EmployeUserData
                console.log(Lenders)
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
                        if (element.users) {
                            arrayLenders.push({name: element.firstName +' '+element.lastName, id: element._id, sort: 0, commission: element.commission, restTime: restTime, class: element.class, img: element.users.userImage != '' ? element.users.userImage : 'no'})
                        }else{
                            arrayLenders.push({name: element.firstName +' '+element.lastName, id: element._id, sort: 0, commission: element.commission, restTime: restTime, class: element.class, img: 'no'})
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
                    res.json({array: arrayLenders, day: day})
                }else{
                    arrayLenders.sort((a, b) => {
                        return a.commission - b.commission;
                    });
                    res.json({array: arrayLenders, day: day})
                }
            }).catch(err => res.send(err))
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

dates.post('/createBlockingHour', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const HourBlocking = conn.model('hoursblocking', dateBlockingSchema)
    const dateBlock = conn.model('datesblocks', datesBlockSchema)
    const Configuration = conn.model('configurations', configurationSchema)
    const splitDate = req.body.dateBlocking.split('-')
    const Day = new Date(splitDate[1]+'-'+splitDate[0]+'-'+splitDate[2]+' 10:00').getDay()
    const employes = req.body.employes
    const data = {
        branch: req.body.branch,
        dateBlocking: splitDate[1]+'-'+splitDate[0]+'-'+splitDate[2],
        employe: req.body.employe,
        start: req.body.start,
        end: req.body.end
    }
    console.log(data)
    try {
        const findDay = await dateBlock.findOne({
            $and: [
                {'dateData.branch': req.body.branch},
                {'dateData.date': data.dateBlocking}
            ]
        })
        console.log(findDay)
        if (findDay) {
            var valid = false
            for (const block of findDay.blocks) {
                if (block.hour == req.body.start) {
                    valid = true
                }
                if (block.hour == req.body.end) {
                    valid = false
                    break
                }
                if (valid) {
                    for (const key in block.employes) {
                        const employe = block.employes[key]
                        if (employe.id == data.employe.id) {
                            data.employe = employe
                            block.employes.splice(key, 1)
                        }
                    }
                }
            }
            try {
                const editBlockDate = await dateBlock.findByIdAndUpdate(findDay._id, {
                    $set: {blocks: findDay.blocks}
                })
                try {
                    const createHour = await HourBlocking.create(data)
                    res.json({status: 'ok'})
                }catch(err){
                    res.send(err)
                }    
            }catch(err){
                res.send(err)
            }
        }else{
            //create a dateBlock register to block hour
            try {
                const findConfiguration = await Configuration.findOne({branch: req.body.branch})
                console.log(Day)
                const getDay = findConfiguration.blockHour.filter(day => day.day == Day)[0]
                // console.log(findConfiguration)
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
                for (let i = 0; i < employes.length; i++) {
                    const element = employes[i];
                    const restInit = element.restTime.split('/')[0]
                    const restEnd = element.restTime.split('/')[1]
                    var inspector = false
                    var hourInit = restInit.split(':')[0]+restInit.split(':')[1]
                    for (let u = 0; u < blocksFirst.length; u++) {
                        const elementTwo = blocksFirst[u];
                        var hour = elementTwo.hour.split(':')[0]+elementTwo.hour.split(':')[1]
                        if (parseFloat(hourInit) <= parseFloat(hour)) {
                            inspector = true
                            if (restEnd == elementTwo.hour) {
                                inspector = false
                                hourInit = 15432154451
                            }
                        }
                        if(!inspector){
                            elementTwo.employes.push({name: element.name, id: element.id, class: element.class, position: i, valid: false, img: element.img})
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
                        dateFormat: new Date(data.dateBlocking+' 10:00'),
                        dateDay: new Date(data.dateBlocking+' 10:00').getDay()
                    },
                    blocks: blocksFirst
                }
                try {
                    const createBlockdate = await dateBlock.create(dataConfiguration)
                    if (createBlockdate) {
                        var valid = false
                        for (const block of blocksFirst) {
                            if (block.hour == req.body.start) {
                                valid = true
                            }
                            if (block.hour == req.body.end) {
                                valid = false
                                break
                            }
                            if (valid) {
                                for (const key in block.employes) {
                                    const employe = block.employes[key]
                                    if (employe.id == data.employe.id) {
                                        data.employe = employe
                                        block.employes.splice(key, 1)
                                    }
                                }
                            }
                        }
                        try {
                            const editBlockDate = await dateBlock.findByIdAndUpdate(createBlockdate._id, {
                                $set: {blocks: blocksFirst}
                            })
                            try {
                                const createHour = await HourBlocking.create(data)
                                res.json({status: 'ok'})
                            }catch(err){
                                res.send(err)
                            }    
                        }catch(err){
                            res.send(err)
                        }
                    }
                }catch(err){res.send(err)}
            }catch(err){res.send(err)}
        }
    }catch(err){
        res.send(err)
    }
})

dates.post('/deleteBlockingHour', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const HourBlocking = conn.model('hoursblocking', dateBlockingSchema)
    const dateBlock = conn.model('datesblocks', datesBlockSchema)
    
    const data = {
        branch: req.body.branch,
        dateBlocking: req.body.dateBlocking,
        employe: req.body.employe,
        start: req.body.start,
        end: req.body.end
    }
    console.log(data)
    try {
        const findDay = await dateBlock.findOne({
            $and: [
                {'dateData.branch': req.body.branch},
                {'dateData.date': data.dateBlocking}
            ]
        })
        console.log(findDay)
        var valid = false
        for (const block of findDay.blocks) {
            if (block.hour == req.body.start) {
                valid = true

            }
            if (block.hour == req.body.end) {
                valid = false
                break
            }
            if (valid) {
                block.employes.unshift(data.employe)
            }
        }
        try {
            const editBlockDate = await dateBlock.findByIdAndUpdate(findDay._id, {
                $set: {blocks: findDay.blocks}
            })
            try {
                const createHour = await HourBlocking.findByIdAndRemove(req.body.id)
                res.json({status: 'ok'})
            }catch(err){
                res.send(err)
            }    
        }catch(err){
            res.send(err)
        }
    }catch(err){
        res.send(err)
    }
})

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
    console.log(req.body.firstBlock)
    if (req.body.firstBlock) {
        const employesServices = req.body.employesServices

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

        for (let i = 0; i < employesServices.length; i++) {
            const employeService = employesServices[i];
            for (let e = 0; e < blocks.length; e++) {
                const block = blocks[e];
                var valid = false
                for (let r = 0; r < block.employes.length; r++) {
                    const employeBlock = block.employes[r];
                    if (employeBlock.id  == employeService.id) {
                        valid = true
                    }
                }
                if (valid == false && blocks[e-1]) {
                    for (let u = 1; u <= hoursdate / 15 - 1; u++) {
                        if (blocks[e - u]) {
                            for (let r = 0; r < blocks[e - u].employes.length; r++) {
                                if (blocks[e - u].employes[r].id  == employeService.id) {
                                    blocks[e - u].employes[r].valid = false
                                }
                            }
                        }
                    }
                }
            }
        }

        // res.json({status: 'ok', data: blocksFirst})
        for (let e = 0; e < blocks.length; e++) {
            const element = blocks[e];
            if (blocks[e-1]) {
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
                if (element.validator == false && blocks[e-1].validator == true && e > 0) {
                    for (let u = 1; u <= hoursdate / 15; u++) {
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
    
        res.json({status: 'ok', data: blocks})
    }else{
        const employeSelect = req.body.employeSelect
        const blockEmploye = []
        for (const block of blocks) {
            var valid = false
            for (const employe of block.employes) {
                if (employe.id == employeSelect) {
                    blockEmploye.push({hour: block.hour, validator: true, origin: true})
                    valid = true
                    break
                }
            }
            if (!valid) {
                blockEmploye.push({hour: block.hour, validator: false, origin: true})
            }
        }

        for (let e = 0; e < blockEmploye.length; e++) {
            const element = blockEmploye[e];
            if (blockEmploye[e-1]) {
                if (element.validator == false && blockEmploye[e-1].validator == true && e > 0) {
                    for (let u = 1; u < hoursdate / 15 + 1; u++) {
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
        res.json({status: 'ok', data: blocks, blockEmploye: blockEmploye})
    }

    
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

dates.put('/uploadDesign/:id', protectRoute, uploadS3.array('image', 3), (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)

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
      res.json({status: 'ok', image: images})
    })
    .catch(err => {
      res.send(err)
      console.log(err)
    })
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

dates.put('/confirmDate/:id', (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)
    console.log(req.body.id)
    date.findByIdAndUpdate(req.body.id, {
        $set: {
            confirmation: true
        }
    })
    .then(confirmDate => {
        res.json({status: 'ok', data: confirmDate})
    })
    .catch(err => res.send(err))
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

dates.put('/removeDate/:id', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)

    try {
        const confirmDate = await date.findByIdAndRemove(req.body.id)
        res.json({status: 'ok'})
    }catch(err){
        res.send(err)
    }
})

dates.put('/removeImage/:id', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const date = conn.model('dates', dateSchema)

    const images = req.body.images
    date.findByIdAndUpdate(req.params.id, {
      $set: {
        imgDesign: images
      }
    })
    .then(change => {
        res.json({status: 'ok', change: change})
    })
    .catch(err => {
      res.send(err)
    })
})

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
            try {
                const findConfiguration = await Configuration.findOne({branch: req.body.branch})
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
                            employeBlock.commission = employeService.commission
                            if (employeBlock.id  == employeService.id) {
                                valid = true
                            }
                        }
                        if (valid == false && blocksFirst[e-1]) {
                            for (let u = 0; u <= hoursdate / 15 - 1; u++) {
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
                        if (element.validator == false && blocksFirst[e-1].validator == true && e > 0) {
                            for (let u = 0; u <= hoursdate / 15; u++) {
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
                        for (const blockEmploye of block.employes) {
                            if (employe.id == blockEmploye.id) {
                                blockEmploye.commission = employe.commission
                            }
                        }
                    }
                }
                
                for (const block of blocksFirst) {
                    block.employes.sort((a, b) => {
                        return a.commission - b.commission;
                    });
                }

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

                res.json({status: 'ok', data: blocksFirst, id: finddate._id})
            }catch(err){
                res.send(err)
            }
        }else{
            try {
                const findConfiguration = await Configuration.findOne({branch: req.body.branch})
                const getDay = findConfiguration.blockHour.filter(day => day.day == Day)[0]
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
                for (let i = 0; i < employes.length; i++) {
                    const element = employes[i];
                    const restInit = element.restTime.split('/')[0]
                    const restEnd = element.restTime.split('/')[1]
                    var inspector = false
                    var hourInit = restInit.split(':')[0]+restInit.split(':')[1]
                    for (let u = 0; u < blocksFirst.length; u++) {
                        const elementTwo = blocksFirst[u];
                        var hour = elementTwo.hour.split(':')[0]+elementTwo.hour.split(':')[1]
                        if (parseFloat(hourInit) <= parseFloat(hour)) {
                            inspector = true
                            if (restEnd == elementTwo.hour) {
                                inspector = false
                                hourInit = 15432154451
                            }
                        }
                        if(!inspector){
                            elementTwo.employes.push({name: element.name, id: element.id, class: element.class, position: i, valid: false, img: element.img})
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
                        date: req.body.date,
                        dateFormat: new Date(req.body.date+' 10:00'),
                        dateDay: new Date(req.body.date+' 10:00').getDay()
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
                                    for (let u = 1; u <= hoursdate / 15 - 1; u++) {
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
                            }
                        }

                        res.json({status: 'ok', data: blocksFirst, id: createBlockdate._id})
                    }
                }catch(err){res.send(err)}
            }catch(err){res.send(err)}
        }
    }catch(err){res.send(err)}
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api para editar bloques

dates.post('/editdateblockbefore' , async (req, res) => {
    const blocks = req.body.block
    const employe = req.body.employe
    const start = req.body.start
    const end = req.body.end
    employe.valid = true
    var valid = false
    for (const block of blocks) {
        if (valid) {
            block.employes.push(employe)
            block.validator = true
            if (block.hour == end) {
                valid = false
            }
        }
        if (block.hour == start) {
            valid = true
            block.employes.push(employe)
            block.validator = true
        }
    }

    res.json({data:blocks})

})

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, hour, branch, employe) -- api that find and create first time blocks (Input: date, timedate, hour, branch, employe)

dates.post('/selectDatesBlocks', async (req, res) => {
    const hoursdate = req.body.timedate
    const hourSelect = req.body.hour
    const employe = req.body.employe
    const blocks = req.body.block

    if(req.body.firstBlock){
        if (!req.body.ifFirstClick) {
            for (let i = 0; i < blocks.length; i++) {
                const element = blocks[i];
                if (element.validator == 'select') {
                    element.validator = true
                    blocks[i].employes.unshift(employe)
                }
            }
        }

        for (let i = 0; i < blocks.length; i++) {
            const element = blocks[i];
            if (element.hour == hourSelect) {
                for (let u = 0; u < hoursdate / 15; u++) {
                    for (let e = 0; e < blocks[i + u].employes.length; e++) {
                        if (blocks[i + u].employes[e].id == employe) {
                            blocks[i + u].employes.splice(e, 1)
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
    
        res.json({status: 'ok', data: blocks, end: end})
    }else{
        //algoritmo para bloques por empleado
        const blockFirst = req.body.blockFirst
        if (!req.body.ifFirstClick) {
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
                    blockFirst[i].employes.unshift(employe)
                }
            }
        }
        // console.log(blocks)
        for (let e = 0; e < blocks.length; e++) {
            const block = blocks[e]
            if (block.hour == hourSelect) {
                for (let i = 0; i <= hoursdate / 15; i++) {
                    blocks[e+i].validator = 'select'
                }
            }
        }

        for (let i = 0; i < blockFirst.length; i++) {
            const element = blockFirst[i];
            if (element.hour == hourSelect) {
                for (let u = 0; u < hoursdate / 15; u++) {
                    for (let e = 0; e < blockFirst[i + u].employes.length; e++) {
                        if (blockFirst[i + u].employes[e].id == employe) {
                            blockFirst[i + u].employes.splice(e, 1)
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
        res.json({status: 'ok', data: blocks, blockFirst: blockFirst, end: end})
    }
    
})

//Fin de la api (Retorna: status, data) -- Api end (Return: status, data)

// -----------------------------------------------------------------------------

//Api que busca y crea los bloques de horarios (Ingreso: date, timedate, hour, branch, employe) -- api that find and create first time blocks (Input: date, timedate, hour, branch, employe)

// dates.post('/selectdatesBlocks', async (req, res) => {
//     const database = req.headers['x-database-connect'];
//     const conn = mongoose.createConnection('mongodb://localhost/'+database, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })
    
//     const dateBlock = conn.model('datesblocks', datesBlockSchema)
//     const Configuration = conn.model('configurations', configurationSchema)

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
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const dateBlock = conn.model('datesblocks', datesBlockSchema)
        
    const datadate = req.body.dataDate
    const datee = req.body.date
    try{
        const finddate = await dateBlock.findOne({
            $and: [ 
                {'dateData.branch': req.body.branch},
                {'dateData.date': datee}
            ]
        })
        if (finddate) {
            console.log(datadate.serviceSelectds)
            for (let i = 0; i < datadate.serviceSelectds.length; i++) {
                var validFinally = false
                const element = datadate.serviceSelectds[i];
                for (const key in finddate.blocks) {
                    var validID = true
                    const elementTwo = finddate.blocks[key]
                    if (element.blocks[0].employes) {
                        if (element.blocks[key].validator == 'select') {
                            for (const employe of elementTwo.employes) {
                                if (employe.id == element.employeId) {
                                    validID = false
                                }
                            }
                            if(validID){
                                console.log('entre')
                                validFinally = true
                                break
                            }
                        }
                    }else{
                        if (element.blocksFirst[key].validator == 'select') {
                            for (const employe of elementTwo.employes) {
                                if (employe.id == element.employeId) {
                                    validID = false
                                }
                            }
                            if(validID){
                                console.log('entre')
                                validFinally = true
                                break
                            }
                        }
                    }
                }
                if (validFinally) {
                    break
                }
            }
            res.json({status: validFinally})
        }
    }catch(err){res.send(err)}
})

//Fin de la api (Retorna: status)  -- Api end (Return: status)

dates.post('/noOneLender',  (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const dates = conn.model('dates', dateSchema)
    const dateBlock = conn.model('datesblocks', datesBlockSchema)

    const dataCitas = []
    const dataDate = req.body.dataDate
    const client = req.body.client
    const date = new Date(req.body.date+' 10:00')
    const blocks = req.body.block
    var nameFile = ''
    if (req.body.pdf == 'not') {
        nameFile = ''
    }else{
        nameFile = req.body.pdf
    }
    const dateID = new Date()
    const id = dateID.getTime()
    for (let index = 0; index < dataDate.serviceSelectds.length; index++) {
        const element = dataDate.serviceSelectds[index];
        var data = {
            branch: req.body.branch,
            start: req.body.date +' '+element.start,
            end: req.body.date +' '+element.end,
            sort: element.sort,
            title: element.name,
            content: req.body.client.name,
            split: element.employeId,
            createdAt: date,
            services: {
                name: element.name, 
                commission: element.commission, 
                price: element.price, 
                discount: element.discount,
                products: element.products,
                employes:element.employes
            },
            duration:element.duration,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
            },
            employe: {
                id: element.employeId,
                name: element.realEmploye,
                class: element.class,
                img: element.employeImg
            },
            microServices: element.microServiceSelect ? element.microServiceSelect : [],
            typeCreation: req.body.typeCreation,
            imgDesign: [],
            class: element.class,
            process: true,
            confirmation: false,
            imgDesign: [],
            confirmationId: id,
            typePay: client.pay,
            payPdf: nameFile
        }
        dataCitas.push(data)
    }
    for (let i = 0; i < dataCitas.length; i++) {
        dates.create(dataCitas[i])
        .then(citas => { })
        .catch(err => console.log(err))
    }

    for (const block of blocks) {
        if (block.validator == 'select') {
            if (block.employes.length > 0) {
                block.validator = true
            }else{
                block.validator = false
            }
        }
    }
    
    dateBlock.findByIdAndUpdate(req.body.blockId, {
        $set: {
            blocks: blocks
        }
    }).then(edit => {
        console.log({confirmationId: id})
        setTimeout(() => {
            dates.find({confirmationId: id})
            .then(dataID => {
                res.json({status: 'ok', id: dataID})
            })
            .catch(err => res.send(err))
        }, 500);
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
      if (index > 0){
        data.services = data.services+' - '+element
      }else{
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
        res.json({status: 'ok'})
    }catch(err){
        res.json({status: 'bad'})
    }
})

dates.post('/endDate/:id', (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Client = conn.model('clients', clientSchema)
    const EndingDates = conn.model('endingdates', endingDateSchema)
    const Dates = conn.model('dates', dateSchema)

    const id = req.params.id
    
    Client.findById(req.body.client.id)
    .then(client => {
        const data = {
            services: req.body.service,
            branch:req.body.branch,
            client: req.body.client,
            employe: req.body.employe,
            microServices: req.body.microServices,
            createdAt: new Date()
        }
        EndingDates.create(data)
        .then(closed => {
            Dates.findByIdAndUpdate(id, {$set: {process: false}})
            .then(end => {
                res.json({status:'ok'})
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

  dates.post('/editdate', async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Dates = conn.model('dates', dateSchema)
    const dateBlock = conn.model('datesblocks', datesBlockSchema)

    const blocks = req.body.blocks
    const dataEdit = req.body.data
    console.log()
    try{
        const editDate = await Dates.findByIdAndUpdate(dataEdit._id,{
            $set: {
                createdAt:dataEdit.createdAt,
                start: formats.datesEdit(dataEdit.createdAt) + ' ' + dataEdit.startEdit,
                end: formats.datesEdit(dataEdit.createdAt) + ' ' + dataEdit.endEdit,
                employe: dataEdit.employe,
                duration: dataEdit.duration
            }
        })
        if (editDate) {
            for (const block of blocks) {
                if (block.validator == 'select') {
                    if (block.employes.length > 0) {
                        block.validator = true
                    }else{
                        block.validator = false
                    }
                }
            }
            try{
                const findBlocks = await  dateBlock.findByIdAndUpdate(dataEdit.idBlock, {
                    $set: {
                        blocks: blocks
                    }
                })

                if (findBlocks) {
                    res.json({status: 'ok'})
                }
            }catch(err){
                res.send(err)
            }
        }
    }catch(err){
        res.send(err)
    }
  })

  
module.exports = dates