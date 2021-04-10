const express = require('express')
const configurations = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const configurationSchema = require('../models/Configurations')
const cors = require('cors')

configurations.use(cors())

configurations.get('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.findOne({branch: req.params.branch})
        if (getConfigurations) {
            res.json({status: 'ok', data: getConfigurations, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

configurations.post('/sameConfiguration', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Configuration = conn.model('configurations', configurationSchema)

    const dataConfiguration = {
        branch: req.body.branch,
        blockHour: req.body.blockHour,
        blackList: req.body.blackList,
        businessName:  req.body.businessName,
        businessPhone: req.body.businessPhone,
        businessType: req.body.businessType,
        businessLocation: req.body.businessLocation,
        onlineDates: req.body.onlineDates,
        typesPay: req.body.typesPay,
        datesPolitics: req.body.datesPolitics
    }
    try {
        const getConfigurations = await Configuration.findOne({branch: req.params.branch})
        if (!getConfigurations) {
            const createConfiguration = await Configuration.create(dataConfiguration)
            res.json({status: 'ok', data: createConfiguration, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

configurations.post('/editConfiguration/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Configuration = conn.model('configurations', configurationSchema)

    const dataConfiguration = {
        blockHour: req.body.blockHour,
        businessName:  req.body.businessName,
        businessPhone: req.body.businessPhone,
        businessType: req.body.businessType,
        businessLocation: req.body.businessLocation,
        onlineDates: req.body.onlineDates,
        typesPay: req.body.typesPay,
        datesPolitics: req.body.datesPolitics
    }
    try {
        const createConfiguration = await Configuration.findByIdAndUpdate(req.params.id, {
            $set: dataConfiguration
        })
        if (createConfiguration) {
            res.json({status: 'ok', token: req.requestToken})  
        }
    }catch(err){
        res.send(err)
    }
})

configurations.post('/addBlackList/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const editConfiguration = await Configuration.findByIdAndUpdate(req.params.id, {
            $push: {
                blackList: req.body.client
            }
        })
        if (editConfiguration) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})


configurations.post('/deleteBlackList/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const editConfiguration = await Configuration.findByIdAndUpdate(req.params.id, {
            $splice: [
                blackList, 
                req.body.position, 
                1
            ]
        })
        if (editConfiguration) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

configurations.delete('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const deleteConfiguration = await Configuration.findOneAndDelete({branch: req.body.branch})
        if (deleteConfiguration) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

module.exports = configurations