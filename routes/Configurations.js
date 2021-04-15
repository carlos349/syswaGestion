const express = require('express')
const configurations = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const configurationSchema = require('../models/Configurations')
const credentialSchema = require('../models/userCrendentials')
const cors = require('cors')

configurations.use(cors())

configurations.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.find()
        if (getConfigurations.length > 0) {
            res.json({status: 'ok', data: getConfigurations, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

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

configurations.post('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Configuration = conn.model('configurations', configurationSchema)

    const dataConfiguration = {
        branch: req.body.branch,
        blockHour: req.body.blockHour,
        blackList: [],
        businessName:  req.body.businessName,
        businessPhone: req.body.businessPhone,
        businessType: req.body.businessType,
        businessLocation: req.body.businessLocation,
        additionalFeatures: {
            onlineDates: true,
            microservices: false,
            editDates: false,
            deleteDates: true
        },
        typesPay: req.body.typesPay,
        currency: req.body.currency,
        datesPolitics: {
            reminderDate: 1,
            minTypeDate: 3,
            limitTimeDate: 3,
            minEditDate: 3,
            editQuantity: 2
        }
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

configurations.post('/createConfigCertificate', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Configuration = conn.model('configurations', configurationSchema)
    const UserCredential = conn.model('credentials', credentialSchema)
    try {
        const getCredentials = await UserCredential.findOne({credential: req.body.secretKey})
        if (getCredentials){
            const dataConfiguration = {
                branch: req.body.branch,
                blockHour: req.body.blockHour,
                blackList: [],
                businessName:  req.body.businessName,
                businessPhone: req.body.businessPhone,
                businessType: req.body.businessType,
                businessLocation: req.body.businessLocation,
                additionalFeatures: {
                    onlineDates: true,
                    microservices: false,
                    editDates: false,
                    deleteDates: true
                },
                typesPay: req.body.typesPay,
                currency: req.body.currency,
                datesPolitics: {
                    reminderDate: 1,
                    minTypeDate: 3,
                    limitTimeDate: 3,
                    minEditDate: 3,
                    editQuantity: 2
                }
            }
            try {
                const getConfigurations = await Configuration.findOne({branch: req.body.branch})
                if (!getConfigurations) {
                    const createConfiguration = await Configuration.create(dataConfiguration)
                    res.json({status: 'ok', data: createConfiguration})
                }
            }catch(err){
                res.send(err)
            }
        }
    }catch(err){res.send(err)}
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


configurations.post('/removeBlackList/:id', protectRoute, async (req, res) => {
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