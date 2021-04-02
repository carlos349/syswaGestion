const express = require('express');
const services = express.Router()
const mongoose = require('mongoose')
const cors = require('cors');
const protectRoute = require('../securityToken/verifyToken')
const serviceSchema = require('../models/Services')
const categorySchema = require('../models/Categories')
services.use(cors())

//output - status, data and token
services.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Service = conn.model('services', serviceSchema)
    
    try{
        const getServices = await Service.find()
        if (getServices.length > 0) {
            res.json({status: 'ok', data: getServices, token: req.requestToken})
        }else{
            res.json({status: 'services not found'})
        }
    }catch(err) {
        res.send(err)
    }
})

//output - status, data and token
services.get('/getCategory', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Category = conn.model('categories', categorySchema)

    try{
        const getCategories = await Category.find()
        if (getCategories.length > 0) {
            res.json({status: 'ok', data: getCategories, token: req.requestToken})
        }else{
            res.json({status: 'services not found'})
        }
    }catch(err) {
        res.send(err)
    }
})

//input - params id . pasar id
//output - status, data and token
services.get('/getServiceInfo/:id', protectRoute, async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Service = conn.model('services', serviceSchema)

    try {
        const service = await Service.findById(req.params.id)
        if (service) {
            res.json({status: 'ok', data: service, token: req.requestToken})
        }else{
            res.json({status: 'service does exist'})
        }
    }catch (err) {
        res.status(404).send(err)
    }
})

//input - form with name (category name of service) . formulario con name (nombre de la categoria del servicio)
// output - status and data
services.post('/servicesByCategory', async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Service = conn.model('services', serviceSchema)
    
    try {
        const services = await Service.find({category: req.body.name})
        if (services.length > 0) {
            res.json({status: 'ok', data: services})
        }else{
            res.json({status: 'dont have services'})
        }
    }catch(err){
        res.status(404).send(err)
    }
})

//input - form with branch, employes, products, name, duration, price, commission, discount and category . formulario con branch, employes, products, name, duration, price, commission, discount and category
//output - status and token
services.post('/', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Service = conn.model('services', serviceSchema)

    const dataServices = {
        branch: req.body.branch,
        employes: req.body.employes,
        products: req.body.products,
        name: req.body.name,
        duration: req.body.duration,
        price: req.body.price,
        commission: req.body.commission,
        discount: req.body.discount,
        category: req.body.category,
        active: true
    }
    console.log(dataServices)
    try{
        const findService = await Service.findOne({
            name: dataServices.name
        })
        if (!findService) {
            const createService = await Service.create(dataServices)
            if (createService) {
                res.json({status: "service created", token: req.requestToken})
            }
        }else{
            res.json({status: "repeat service"})
        }
    }catch(err){
        res.send(err)
    } 
})

//input - form with name and branch . formulario con name y branch
//output - status, data and token
services.post('/newCategory', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Category = conn.model('categories', categorySchema)

    const dataCategory = {
        name: req.body.name,
        branch: req.body.branch
    }
    try{
        const findCategory = await Category.findOne({
            name: req.body.name
        })
        if (!findCategory) {
            const createCategory = await Category.create(dataCategory)
            res.json({status: 'category created', data: createCategory, token: req.requestToken})
        }else{
            res.json({status: 'category already exist'})
        }
    }catch(err){
        res.send(err)
    }
})

//input - params id, form with branch, employes, products, name, duration, price, commission, discount, category . pasar id, formulario con branch, employes, products, name, duration, price, commission, discount, category
//output - status and token
services.put('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Service = conn.model('services', categorySchema)
    
    try{
        const editService = await Service.findByIdAndUpdate(req.params.id, {
            $set: {
                branch: req.body.branch,
                employes: req.body.employes,
                products: req.body.products,
                name: req.body.name,
                duration: req.body.duration,
                price: req.body.price,
                commission: req.body.commission,
                discount: req.body.discount,
                category: req.body.category,
            }
        })
        if (editService) {
            res.json({status: 'ok', token: req.requestToken})
        }else{
            res.json({status: 'services does exist'})
        }
    }catch(err){
        res.send(err)
    }
})

//input - params id . pasar id
// output - status, data and token
services.put('/changeActive/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Service = conn.model('services', categorySchema)

    try{
        const findService = await Service.findById(req.params.id)
        if (findService.active) {
            const changeActive = await Service.findByIdAndUpdate(req.params.id, {
                $set: {
                    active: false
                }
            })
            res.json({status: 'ok', data: false, token: req.requestToken})
        }else{
            const changeActive = await Service.findByIdAndUpdate(req.params.id, {
                $set: {
                    active: false
                }
            })
            res.json({status: 'ok', data: true, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

module.exports = services