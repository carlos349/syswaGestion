const express = require('express');
const branches = express.Router()
const mongoose = require('mongoose')
const cors = require('cors');
const protectRoute = require('../securityToken/verifyToken')
const branchSchema = require('../models/Branch')
const credentialSchema = require('../models/userCrendentials')
const LogService = require('../logService/logService')
branches.use(cors())
const connect = require('../mongoConnection/conectionInstances')

branches.get('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Branch = connect.useDb(database).model('branches', branchSchema)

    try {
        const getBranches = await Branch.find()
        if (getBranches.length > 0) {
            res.json({status: 'ok', data: getBranches, token: req.requestToken})
        }else{
            res.json({status:'bad'})
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
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

branches.get('/count', async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Branch = connect.useDb(database).model('branches', branchSchema)

    try {
        const getCount = await Branch.find().count()
        res.json({status: 'ok', data: getCount})
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
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

branches.post('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Branch = connect.useDb(database).model('branches', branchSchema)
    const dataBranch = {
        name: req.body.branch,
        productsCount: 0,
        createdAt: new Date()
    }
    try {
        const findBranch = await Branch.findOne({name: req.body.branch})
        if (!findBranch) {
            try {
                const createBranch = await Branch.create(dataBranch)
                if (createBranch) {
                    res.json({status: 'ok', data: createBranch, token: req.requestToken})
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
                const dataLog = await Log.createLog()
                res.send('failed api with error, '+ dataLog.error)
            }
        }else{
            res.json({status: 'bad', token: req.requestToken})
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
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

branches.post('/createBranchCertificate', async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Branch = connect.useDb(database).model('branches', branchSchema)
    const UserCredential = connect.useDb(database).model('credentials', credentialSchema)
    try {
        const getCredentials = await UserCredential.findOne({credential: req.body.secretKey})
        if (getCredentials){
            const dataBranch = {
                name: req.body.branch,
                productsCount: 0,
                createdAt: new Date()
            }
            try {
                const findBranch = await Branch.findOne({name: req.body.branch})
                if (!findBranch) {
                    try {
                        const createBranch = await Branch.create(dataBranch)
                        if (createBranch) {
                            res.json({status: 'ok', data: createBranch})
                        }
                    }catch(err){res.send(err)}
                }
            }catch(err){res.send(err)}
        }else{
            res.json({data:req.body.secretKey})
        }
    }catch(err){res.send(err)}
})

branches.delete('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Branch = connect.useDb(database).model('branches', branchSchema)

    //por definir
})

branches.put('/changeActive/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Branch = connect.useDb(database).model('branches', branchSchema)

    try{
        const findBranch = await Branch.findById(req.params.id)
        if (findBranch.active == true) {
            const changeActive = await Branch.findByIdAndUpdate(req.params.id, {
                $set: {
                    active: false
                }
            })
            res.json({status: 'ok', data: false, token: req.requestToken})
        }else{
            const changeActive = await Branch.findByIdAndUpdate(req.params.id, {
                $set: {
                    active: true
                }
            })
            res.json({status: 'ok', data: true, token: req.requestToken})
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
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
})

module.exports = branches