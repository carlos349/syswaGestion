
const express = require('express')
const configurations = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const configurationSchema = require('../models/Configurations')
const profilesSchema = require('../models/accessProfile')
const credentialSchema = require('../models/userCrendentials')
const cors = require('cors')

configurations.use(cors())

configurations.get('/profiles', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Profiles = conn.model('accessprofiles', profilesSchema)

    try {
        const getProfiles = await Profiles.find().limit(1)
        res.json({status: 'ok', data: getProfiles, token: req.requestToken})
    }catch(err){
        res.send(err)
    }
})

configurations.get('/:branch', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.findOne({
            branch: req.params.branch
        })
        if (getConfigurations) {
            res.json({status: 'ok', data: getConfigurations, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})


configurations.get('/getProfiles', async (req, res) => {
    const database = req.headers['x-database-connect'];
    console.log(database)
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    console.log(database)
    // res.json({status: 'ok', data: database, token: req.requestToken})
    
})

configurations.get('/addFirstProfile', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Profiles = conn.model('accessprofiles', profilesSchema)

    try {
        const createProfile = await Profiles.create({
            profiles: [
                {
                    profile: "Gerente",
                    routes: [
                        {
                            "ruta" : "usuarios",
                            "validaciones" : [
                                "editar",
                                "registrar",
                                "eliminar"
                            ]
                        },
                        {
                            "ruta" : "procesar",
                            "validaciones" : [
                                "editar",
                                "nuevo_cliente",
                                "nuevo_servicio",
                                "descuento"
                            ]
                        },
                        {
                            "ruta" : "metricas",
                            "validaciones" : [
                                "filtrar"
                            ]
                        },
                        {
                            "ruta" : "ventas",
                            "validaciones" : [
                                "filtrar",
                                "anular",
                                "detalle"
                            ]
                        },
                        {
                            "ruta" : "servicios",
                            "validaciones" : [
                                "editar",
                                "ingresar",
                                "activaciones"
                            ]
                        },
                        {
                            "ruta" : "empleados",
                            "validaciones" : [
                                "registrar",
                                "detalle",
                                "editar",
                                "reportes",
                                "cerrar ventas",
                                "eliminar",
                                "adelantos",
                                "correos"
                            ]
                        },
                        {
                            "ruta" : "clientes",
                            "validaciones" : [
                                "filtrar",
                                "registrar",
                                "editar",
                                "detalle",
                                "eliminar",
                                "correos"
                            ]
                        },
                        {
                            "ruta" : "inventario",
                            "validaciones" : [
                                "filtrar",
                                "registrar",
                                "editar",
                                "detalle",
                                "eliminar"
                            ]
                        },
                        {
                            "ruta" : "gastos",
                            "validaciones" : [
                                "registrar"
                            ]
                        },
                        {
                            "ruta" : "agendamiento",
                            "validaciones" : [
                                "filtrar",
                                "agendar",
                                "todas",
                                "editar",
                                "eliminar",
                                "cerrar",
                                "finalizar",
                                "procesar"
                            ]
                        },
                        {
                            "ruta" : "caja",
                            "validaciones" : [ ]
                        },
                        {
                            "ruta" : "pedidos",
                            "validaciones" : [
                                "filtrar",
                                "registrar",
                                "editar",
                                "detalle",
                                "eliminar",
                                "correos"
                            ]
                        },
                        {
                            "ruta" : "sucursales",
                            "validaciones" : [
                            ]
                        },
                        {
                            "ruta" : "bodega",
                            "validaciones" : [
                            ]
                        }
                    ]
                }
            ],
            createdAt: new Date()
        })
        res.json({status: 'ok', data: createProfile})
    }
    catch(err){
        res.send(err)
    }
})

configurations.get('/getMicroservice/:branch', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.find({
            $and: [
                {branch: req.params.branch},
                {'datesPolitics.microServices': true}
            ]
        })
        if (getConfigurations.length > 0) {
            if (getConfigurations[0].microServices.length > 0) {
                res.json({status: 'ok', data: getConfigurations[0].microServices, token: req.requestToken})
            }else{
               res.json({status: 'bad', token: req.requestToken})     
            }
        }else{
            res.json({status: 'bad', token: req.requestToken})
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

configurations.get('/getHours/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.findOne({branch: req.params.branch})
        if (getConfigurations) {
            var daysHours = []
            var daysKey = {
                0: 'Domingo',
                1: 'Lunes',
                2: 'Martes',
                3: 'Miércoles',
                4: 'Jueves',
                5: 'Viernes',
                6: 'Sábado'
            }
            for (const key in getConfigurations.blockHour) {
                const days = getConfigurations.blockHour[key]
                var splitHour = days.start.split(':')[0]
                var splitMinutes = days.start.split(':')[1]
                daysHours.push({
                    day: daysKey[days.day],
                    value: days.day,
                    valid: days.status,
                    start: 'Desde',
                    end: 'Hasta',
                    hour: []
                })
                for (let i = 0; i < days.time / 15 + 1; i++) {
                    if (i == 0) {
                        daysHours[key].hour.push(days.start)
                        splitMinutes = parseFloat(splitMinutes) + 15
                        splitHour = splitMinutes == 60 ? parseFloat(splitHour) + 1 : splitHour
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                    }else{
                        daysHours[key].hour.push(splitHour+':'+splitMinutes)
                        splitMinutes = parseFloat(splitMinutes) + 15
                        splitHour = splitMinutes == 60 ? parseFloat(splitHour) + 1 : splitHour
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                    }
                }
            }
            var objectPush = daysHours[0]
            daysHours.splice(0, 1)
            daysHours.push(objectPush)
            console.log(daysHours)
            res.json({status: 'ok', data: daysHours, token: req.requestToken})
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
        typesPay: req.body.typesPay,
        currency: req.body.currency,
        datesPolitics: {
            reminderDate: 1,
            minTypeDate: 3,
            limitTimeDate: 3,
            minEditDate: 3,
            editQuantity: 2,
            onlineDates: true,
            microServices: false,
            editDates: false,
            deleteDates: true
        },
        microService:[]
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
                typesPay: req.body.typesPay,
                currency: req.body.currency,
                datesPolitics: {
                    reminderDate: 1,
                    minTypeDate: 3,
                    limitTimeDate: 3,
                    minEditDate: 3,
                    editQuantity: 2,
                    onlineDates: true,
                    microServices: false,
                    editDates: false,
                    deleteDates: true
                },
                microService:[]
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
        blackList: req.body.blackList,
        businessName:  req.body.businessName,
        businessPhone: req.body.businessPhone,
        businessType: req.body.businessType,
        businessLocation: req.body.businessLocation,
        currency: req.body.currency,
        typesPay: req.body.typesPay,
        datesPolitics: req.body.datesPolitics,
        microServices: req.body.microServices
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

configurations.put('/editProfiles/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Profiles = conn.model('accessprofiles', profilesSchema)

    try {
        const editProfile = await Profiles.findByIdAndUpdate(req.params.id, {
            $set : {
                profiles: req.body.profiles
            }
        })
        if (editProfile) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }catch(err){res.send(err)}
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