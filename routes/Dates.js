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

// input - null
// output - status, data, token
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
            res.json({status: 'bad', data: getDates, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

module.exports = dates