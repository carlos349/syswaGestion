const express = require('express');
const services = express.Router()
const mongoose = require('mongoose')
const cors = require('cors');
const protectRoute = require('../securityToken/verifyToken')
const serviceSchema = require('../models/Services')
const categorySchema = require('../models/Categories')
const LogService = require('../logService/logService')
const connect = require('../mongoConnection/conectionInstances')
services.use(cors())

services.get('/getCategories/:branch', protectRoute, async (req, res) => {
    try {
        const database = req.headers['x-database-connect'];
        const Category = connect.useDb(database).model('categories', categorySchema)
        try{
        
            const getCategories = await Category.find({branch: req.params.branch})
            if (getCategories.length > 0) {
                res.json({status: 'ok', data: getCategories, token: req.requestToken})
            }else{
                res.json({status: 'categories not found'})
            }
        }catch(err) {
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

//output - status, data and token
services.get('/getCategoriesForClients/:branch', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Category = connect.useDb(database).model('categories', categorySchema)

    try{
        const getCategories = await Category.find({branch: req.params.branch})
        if (getCategories.length > 0) {
            res.json({status: 'ok', data: getCategories, token: req.requestToken})
        }else{
            res.json({status: 'categories not found'})
        }
    }catch(err) {
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

//output - status, data and token
services.get('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Service = connect.useDb(database).model('services', serviceSchema)
    
    try{
        const getServices = await Service.find({branch: req.params.branch})
        if (getServices.length > 0) {
            res.json({status: 'ok', data: getServices, token: req.requestToken})
        }else{
            res.json({status: 'services not found'})
        }
    }catch(err) {
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
//output - status, data and toke
services.get('/servicesForClients/:branch', async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Service = connect.useDb(database).model('services', serviceSchema)
    
    try{
        const getServices = await Service.find({branch: req.params.branch})
        if (getServices.length > 0) {
            res.json({status: 'ok', data: getServices, token: req.requestToken})
        }else{
            res.json({status: 'services not found'})
        }
    }catch(err) {
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

//input - params id . pasar id
//output - status, data and token
services.get('/getServiceInfo/:id', async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    const Service = connect.useDb(database).model('services', serviceSchema)

    try {
        const service = await Service.findById(req.params.id)
        if (service) {
            res.json({status: 'ok', data: service})
        }else{
            res.json({status: 'service does exist'})
        }
    }catch (err) {
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

//input - form with name (category name of service) . formulario con name (nombre de la categoria del servicio)
// output - status and data
services.post('/servicesByCategory', async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    
    const Service = connect.useDb(database).model('services', serviceSchema)
    
    try {
        const services = await Service.find({
            $and: [
                {category: req.body.name},
                {branch: req.body.branch}
            ]
        })
        if (services.length > 0) {
            res.json({status: 'ok', data: services})
        }else{
            res.json({status: 'dont have services'})
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
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

//input - form with branch, employes, products, name, duration, price, commission, discount and category . formulario con branch, employes, products, name, duration, price, commission, discount and category
//output - status and token
services.post('/', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    
    const Service = connect.useDb(database).model('services', serviceSchema)

    const dataServices = {
        branch: req.body.branch,
        employes: req.body.employes,
        products: req.body.products,
        name: req.body.name,
        additionalName: req.body.additionalName,
        duration: req.body.duration,
        price: req.body.price,
        commission: req.body.commission,
        discount: req.body.discount,
        category: req.body.category,
        prepayment: {
            ifPrepayment: req.body.prepayment,
            amount: req.body.prepayment ? req.body.prepaymentAmount : 0
        },
        active: true
    }
    try{
        const findService = await Service.findOne({
            $and: [
                {name: dataServices.name},
                {branch: dataServices.branch}
            ]
        })
        if (!findService) {
            const createService = await Service.create(dataServices)
            if (createService) {
                res.json({status: "ok", token: req.requestToken})
            }
        }else{
            res.json({status: "repeat service"})
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
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    } 
})

//input - form with name and branch . formulario con name y branch
//output - status, data and token
services.post('/newCategory', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Category = connect.useDb(database).model('categories', categorySchema)
    
    const dataCategory = {
        name: req.body.name.trim(),
        branch: req.body.branch
    }
    try{
        const findCategory = await Category.findOne({
            $and: [
                {name: req.body.name},
                {branch: req.body.branch}
            ]
        })
        if (!findCategory) {
            try {
                const createCategory = await Category.create(dataCategory)
                res.json({status: 'ok', data: createCategory, token: req.requestToken})
            }catch(err ){
                res.send(err)
            }
        }else{
            res.json({status: 'category already exist'})
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

//input - params id, form with branch, employes, products, name, duration, price, commission, discount, category . pasar id, formulario con branch, employes, products, name, duration, price, commission, discount, category
//output - status and token
services.put('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Service = connect.useDb(database).model('services', serviceSchema)
    const prepayment = {
        ifPrepayment: req.body.prepayment,
        amount: req.body.prepayment ? req.body.prepaymentAmount : 0
    }
    try{
        const editService = await Service.findByIdAndUpdate(req.params.id, {
            $set: {
                branch: req.body.branch,
                name: req.body.name,
                additionalName: req.body.additionalName,
                duration: req.body.duration,
                price: req.body.price,
                products: req.body.products,
                commission: req.body.commission,
                discount: req.body.discount,
                category: req.body.category,
                employes: req.body.employes,
                prepayment: prepayment
            }
        })
        if (editService) {
            res.json({status: 'ok', token: req.requestToken})
        }else{
            res.json({status: 'services does exist'})
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
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

//input - params id . pasar id
// output - status, data and token
services.put('/changeActive/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Service = connect.useDb(database).model('services', serviceSchema)

    try{
        const findService = await Service.findById(req.params.id)
        if (findService.active == true) {
            const changeActive = await Service.findByIdAndUpdate(req.params.id, {
                $set: {
                    active: false
                }
            })
            res.json({status: 'ok', data: false, token: req.requestToken})
        }else{
            const changeActive = await Service.findByIdAndUpdate(req.params.id, {
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
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

//input - params id . pasar id
// output - status, data and token
services.delete('/deleteCategory/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Category = connect.useDb(database).model('categories', categorySchema)

    try{
        const removeCategory = await Category.findByIdAndRemove(req.params.id)
        if (removeCategory) {
            res.json({status: 'ok', token: req.requestToken})
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
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

//input - params id . pasar id
// output - status, data and token
services.delete('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Service = connect.useDb(database).model('services', serviceSchema)

    try{
        const removeCategory = await Service.findByIdAndRemove(req.params.id)
        if (removeCategory) {
            res.json({status: 'ok', token: req.requestToken})
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
        Log.createLog()
        .then(dataLog => {
            res.send('failed api with error, '+ dataLog.error)
        })
    }
})

module.exports = services