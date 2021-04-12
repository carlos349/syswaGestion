const express = require('express');
const branches = express.Router()
const mongoose = require('mongoose')
const cors = require('cors');
const protectRoute = require('../securityToken/verifyToken')
const branchSchema = require('../models/Branch')
branches.use(cors())

branches.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Branch = conn.model('branches', branchSchema)

    try {
        const getBranches = await Branch.find()
        if (getBranches.length > 0) {
            res.json({status: 'ok', data: getBranches, token: req.requestToken})
        }
    }catch(err){res.send(err)}
})

branches.post('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Branch = conn.model('branches', branchSchema)
    const dataBranch = {
        name: req.body.branch,
        createdAt: new Date()
    }
    try {
        const findBranch = await Branch.findOne({name: req.body.branch})
        if (!findBranch) {
            try {
                const createBranch = await Branch.create(dataBranch)
                if (createBranch) {
                    res.json({status: 'ok', token: req.requestToken})
                }
            }catch(err){res.send(err)}
        }
    }catch(err){res.send(err)}
})

branches.delete('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Branch = conn.model('branches', branchSchema)

    //por definir
})

module.exports = branches