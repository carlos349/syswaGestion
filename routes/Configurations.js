
const express = require('express')
const configurations = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const userSchema = require('../models/Users')
const datesBlockSchema = require('../models/datesBlocks')
const configurationSchema = require('../models/configurations')
const logSchema = require('../models/Log')
const profilesSchema = require('../models/accessProfile')
const credentialSchema = require('../models/userCrendentials')
const employeSchema = require('../models/Employes')
const branchSchema = require('../models/Branch')
const LogService = require('../logService/logService')
const uploadS3 = require('../common-midleware/index')
const jwt = require('jsonwebtoken')
const key = require('../private/key-jwt');
const cors = require('cors')
const connect = require('../mongoConnection/conectionInstances')
configurations.use(cors())

configurations.get('/profiles', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Profiles = connect.useDb(database).model('accessprofiles', profilesSchema)

    try {
        const getProfiles = await Profiles.find().limit(1)
        res.json({status: 'ok', data: getProfiles, token: req.requestToken})
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

configurations.get('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.find()
        res.json({status: 'ok', data: getConfigurations})
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

configurations.get('/clientlog', async (req, res) => {
    const database = req.headers['x-database-connect'];

    const Logs = connect.useDb("syswalogs").model('logs', logSchema)

    try {
        const getLog = await Logs.find({
            database: database
        })
        if (getLog) {
            res.json({status: 'ok', data: getLog})
        }
    }catch(err){
        console.log(err)
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

configurations.get('/:branch', async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.findOne({
            branch: req.params.branch
        })
        if (getConfigurations) {
            res.json({status: 'ok', data: getConfigurations})
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


configurations.get('/getProfiles', async (req, res) => {
    const database = req.headers['x-database-connect'];
    // res.json({status: 'ok', data: database, token: req.requestToken})
    
})

configurations.get('/getMicroservice/:branch', async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.find({
            $and: [
                {branch: req.params.branch},
                {'datesPolitics.microServices': true}
            ]
        })
        if (getConfigurations.length > 0) {
            if (getConfigurations[0].microServices.length > 0) {
                res.json({status: 'ok', data: getConfigurations[0].microServices})
            }else{
               res.json({status: 'bad'})     
            }
        }else{
            res.json({status: 'bad'})
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

configurations.get('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

    try {
        const getConfigurations = await Configuration.findOne({branch: req.params.branch})
        if (getConfigurations) {
            res.json({status: 'ok', data: getConfigurations, token: req.requestToken})
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

configurations.get('/getHours/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

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
            res.json({status: 'ok', data: daysHours, token: req.requestToken})
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

configurations.post('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

    const dataConfiguration = {
        branch: req.body.branch,
        blockHour: req.body.blockHour,
        blackList: [],
        businessName:  req.body.businessName,
        businessPhone: req.body.businessPhone,
        businessType: req.body.businessType,
        businessLocation: req.body.businessLocation,
        bussinessLogo: req.body.file,
        businessEmail: req.body.email,
        bussinessRoute: req.body.route,
        typesPay: req.body.typesPay,
        currency: req.body.currency,
        datesPolicies: req.body.datesPolicies,
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
        giftCard:  {
            online: true,
            section: true,
            politics: '',
            timeLimit: 3
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

configurations.post('/uploadLogo', protectRoute, uploadS3.single("image"), (req, res) => {
    if (req.file) {
        res.json({status: 'ok', file: req.file.location})
    }else{
        res.json({status: 'bad'})
    }
})

configurations.post('/deletehourforday', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

    try {
        const removeDay = await Configuration.updateOne({blockedDays: {$elemMatch:{key:req.body.key}}},{$pull:{blockedDays:{key:req.body.key}}})
        if (removeDay) {
            res.json({status: 'ok'})
        }
    } catch (error) {
        console.log(error)
    }
})

configurations.post('/addBlockedday', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

    try{
        var valid = true
        req.body.dates.forEach(element => {
            if(element.date == req.body.date){
                valid = false
            }
        });
        if (valid) {
            const addDay = await Configuration.findByIdAndUpdate(req.body.id, {
                $push: {
                    blockedDays: {date:req.body.date, key: new Date().getTime()}
                }
            })
            if(addDay){
                res.json({status: 'ok'})
            }
        }else{
            res.json({status: 'repeated'})
        }
        
    }catch(err){
        console.log(err)
    }
})

configurations.post('/createConfigCertificate', async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)
    const UserCredential = connect.useDb(database).model('credentials', credentialSchema)
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
                businessEmail: req.body.email,
                bussinessLogo: '',
                bussinessRoute: req.body.route,
                typesPay: req.body.typesPay,
                currency: req.body.currency,
                datesPolicies: "<p>Crea tu contenido de políticas.</p>",
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
                giftCard:  {
                    online: true,
                    section: true,
                    politics: '',
                    timeLimit: 3
                },
                microService:[],
                notificationDiscount: false
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
    

    const Profiles = connect.useDb(database).model('accessprofiles', profilesSchema)

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
                                "eliminar",
                                "perfiles"
                            ]
                        },
                        {
                            "ruta" : "procesar",
                            "validaciones" : [
                                "editar_cliente",
                                "nuevo_cliente",
                                "descuento"
                            ]
                        },
                        {
                            "ruta" : "reportes",
                            "validaciones" : [
                                "filtrar"
                            ]
                        },
                        {
                            "ruta" : "ventas",
                            "validaciones" : [
                                "filtrar",
                                "anular",
                                "detalle",
                                "correo",
                                "reporte"
                            ]
                        },
                        {
                            "ruta" : "servicios",
                            "validaciones" : [
                                "editar",
                                "ingresar",
                                "activaciones",
                                "categoria",
                                "eliminar"
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
                                "correos",
                                "excel"
                            ]
                        },
                        {
                            "ruta" : "inventario",
                            "validaciones" : [
                                "cerrar",
                                "cambiar_tipo"
                            ]
                        },
                        {
                            "ruta" : "gastos",
                            "validaciones" : [
                                "registrar_bono",
                                "registrar_gasto",
                                "cierre",
                                "registrar_inversion",
                                "filtrar",
                                "eliminar"
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
                                "confirmacion"
                            ]
                        },
                        {
                            "ruta" : "caja",
                            "validaciones" : [
                                "fondo",
                                "cerrar",
                                "visualizar",
                                "editar",
                                "reporte"
                            ]
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
                                "cambiar",
                                "registrar",
                                "configurar"
                            ]
                        },
                        {
                            "ruta" : "bodega",
                            "validaciones" : [
                                "registrar_producto",
                                "gestion_sucursales",
                                "registrar_proveedores",
                                "cierre_bodega",
                                "anexar_productos",
                                "editar_producto",
                                "eliminar_producto",
                                "editar_proveedor",
                                "eliminar_proveedor",
                                "ver_historial_compras"
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
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)
    const Branch = connect.useDb(database).model('branches', branchSchema)
    const dataConfiguration = {
        blockHour: req.body.blockHour,
        blackList: req.body.blackList,
        businessName:  req.body.businessName,
        businessPhone: req.body.businessPhone,
        businessType: req.body.businessType,
        businessLocation: req.body.businessLocation,
        businessEmail: req.body.businessEmail,
        bussinessLogo: req.body.bussinessLogo,
        giftCard: req.body.giftCard,
        currency: req.body.currency,
        typesPay: req.body.typesPay,
        datesPolitics: req.body.datesPolitics,
        microServices: req.body.microServices,
        datesPolicies: req.body.datesPolicies,
        notificationDiscount: req.body.notificationDiscount
    }
    try {
        const createConfiguration = await Configuration.findByIdAndUpdate(req.params.id, {
            $set: dataConfiguration
        })
        if (createConfiguration) {
            console.log(createConfiguration)
            try {
                const editBranch = await Branch.findByIdAndUpdate(createConfiguration.branch, {
                    $set: {
                        name: req.body.businessName
                    }
                })
                res.json({status: 'ok', token: req.requestToken})  
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

configurations.post('/editblockhour', async (req,res) => {
    const database = req.headers['x-database-connect'];
    
    const dateBlock = connect.useDb(database).model('datesblocks', datesBlockSchema)
    const Employe = connect.useDb(database).model('employes', employeSchema)
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
                const blocks = block.blocks
                let splitMinutes, splitHour, hour
                const splitStart = element.start.split(":")[0]+element.start.split(":")[1]
                const splitFirst = first.split(":")[0]+first.split(":")[1]
                const splitEnd = element.end.split(":")[0]+element.end.split(":")[1]
                const splitLast = last.split(":")[0]+last.split(":")[1]
                if (first != element.start && parseFloat(splitStart) < parseFloat(splitFirst) ) {
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
                        blocks.unshift({hour: hour, validator:true, employes: employesArray, employeBlocked: []})
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
                        splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                        
                        hour = splitHour+':'+splitMinutes
                        blocks.push({hour: hour, validator:true, employes: employesArray, employeBlocked: []})
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

configurations.post('/addBlackList/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

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


configurations.post('/removeBlackList/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

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
    

    const Profiles = connect.useDb(database).model('accessprofiles', profilesSchema)

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

configurations.put('/editAccessUsers/:name', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const User = connect.useDb(database).model('users', userSchema)

    try {
        const findUsers = await User.updateMany(
            {
                status: req.params.name
            },
            {
                $set: {access: req.body.access, notificationLimited: req.body.notificationLimited}
            }
        )
        if (findUsers) {
            try {
                const findUser = await User.findById(req.body.id)
                if (findUser.status == req.params.name) {
                    const payload = {
						_id: findUser._id,
						first_name: findUser.first_name,
						last_name: findUser.last_name,
                        branch: findUser.branch,
						email: findUser.email,
						about: findUser.about,
						status: findUser.status,
						access: findUser.access,
						userImage: findUser.userImage,
						LastAccess: findUser.LastAccess,
						linkLender: findUser.linkLender
					}
					let token = jwt.sign(payload, key, {
						expiresIn: 60 * 60 * 24
					})
                    res.json({status: 'reload', token: token})
                }else{
                    res.json({status: 'notReload', token: req.requestToken})
                }
            }catch(err){
                res.send(err)
            }
        }
    }catch(err){res.send(err)}
})

configurations.delete('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const Configuration = connect.useDb(database).model('configurations', configurationSchema)

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