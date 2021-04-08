const express = require('express')
const dates = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const key = require('../private/key-jwt');
const protectRoute = require('../securityToken/verifyToken')
const dateSchema = require('../models/Dates')
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

dates.get('(getdatesbyemploye/:id', protectRoute, async (req, res) => {
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
        const inspector = await Date.find({$and:[
            {
                'client.id': req.body.client.id,
                'employe.id': req.body.employe.id,
                createdAt: req.body.date,
                branch: req.body.branch,
                start: req.body.start,
                end: req.body.end
            }
        ]})
        if (inspector.length > 0 ) {
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

dates.delete('/:id', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Date = conn.model('dates', dateSchema)

    try{
        const deleteDate = await Date.delete(req.params.id)
        if (deleteDate) {
            res.json({status:'deleted'})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api (Retorna: Respuesta simple) -- Api end (Return: Simple response)

module.exports = dates