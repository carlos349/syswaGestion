
const express = require('express')
const configurations = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const datesBlockSchema = require('../models/datesBlocks')
const configurationSchema = require('../models/Configurations')
const profilesSchema = require('../models/accessProfile')
const credentialSchema = require('../models/userCrendentials')
const employeSchema = require('../models/Employes')
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

configurations.post('/addFirstProfile', async (req, res) => {
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

configurations.post('/editblockhour', async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const dateBlock = conn.model('datesblocks', datesBlockSchema)
    const Employe = conn.model('employes', employeSchema)
    let employesArray = []
    try{
        const findEmployes = await Employe.find({branch:req.body.branch})
        if (findEmployes) {
            const employes = findEmployes
            employes.forEach(element => {
                employesArray.push({name: element.firstName + ' ' + element.lastName, id: element._id, class:element.class, valid:false, img: element.img ? element.img : 'no'})
            });
        }
    }catch(err){
        res.send(err)
    }

    const element = req.body.blockHour
    dateBlock.find({$and:[{"dateData.dateDay": element.day}, {"dateData.branch":req.body.branch}]})
    .then(res => {
        if (res.length > 0) {
            for (let i = 0; i < res.length; i++) {
                const block = res[i];
                
                const first = block.blocks[0].hour
                const last = block.blocks[block.blocks.length - 1].hour
                console.log(last)
                const blocks = block.blocks
                let splitMinutes, splitHour, hour
                const splitStart = element.start.split(":")[0]+element.start.split(":")[1]
                const splitFirst = first.split(":")[0]+first.split(":")[1]
                const splitEnd = element.end.split(":")[0]+element.end.split(":")[1]
                const splitLast = last.split(":")[0]+last.split(":")[1]
                 console.log("ESTE:"+ splitLast)
                if (first != element.start && parseFloat(splitStart) < parseFloat(splitFirst) ) {
                    console.log("entra aqui?")
                    splitMinutes = first.split(":")[1]
                    splitHour = first.split(":")[0]
                    
                    for (let q = 0; q < 120; q++) {
                        splitMinutes = parseFloat(splitMinutes - 15)
                        if (splitMinutes == (-15)) {
                            splitHour--
                        } 
                        
                        splitMinutes = splitMinutes == -15 ? '45' : splitMinutes
                        if (splitMinutes == 0) {
                            splitMinutes = '00'
                        }
                        hour = splitHour+':'+splitMinutes
                        blocks.unshift({hour: hour, validator:true, employes: employesArray})
                        if (hour == element.start) {
                            break
                        }
                    }
                }
                if (first != element.start && parseFloat(splitStart) > parseFloat(splitFirst)) {
                    for (let a = 0; a < 120; a++) {
                        blocks.splice(0,1)
                        if (blocks[0].hour == element.start) {
                            break
                        }
                    }
                    
                }
                if (last != element.end && parseFloat(splitEnd) > parseFloat(splitLast)) {
                    splitMinutes = last.split(":")[1]
                    splitHour = last.split(":")[0]
                    for (let q = 0; q < 120; q++) {
                        splitMinutes = parseFloat(splitMinutes) + parseFloat(15)
                        if (splitMinutes == 60) {
                            splitHour++
                        }
                        console.log('hour:' + splitHour + 'minute:' + splitMinutes)
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                        
                        hour = splitHour+':'+splitMinutes
                        blocks.push({hour: hour, validator:true, employes: employesArray})
                        if (hour == element.end) {
                            break
                        }
                    }
                }
                if (last != element.end && parseFloat(splitEnd) < parseFloat(splitLast)) {
                    for (let a = 0; a < 120; a++) {
                        blocks.splice(blocks.length - 1,1)
                        if (blocks[blocks.length - 1].hour == element.end) {
                            break
                        }
                    }
                    
                }
                console.log("aqui")
                console.log(blocks[0])
                dateBlock.findByIdAndUpdate(block._id,{
                    $set:{
                        blocks:blocks
                    }
                }).then(resEdit=>{}) 
            }
            
        }
        res.json({status:'ok'})
    }).catch(err => res.send(err))
})

module.exports = configurations