const express = require('express')
const notifications = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const LogService = require('../logService/logService')
const userSchema = require('../models/Users')
const notificationSchema = require('../models/Notifications')
const cors = require('cors')
const connect = require('../mongoConnection/conectionInstances')
notifications.use(cors())

//Api que busca todas las notificaciones (Ingreso: Nullo) -- Api that search all the notifications (Input: Null)

notifications.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Notification = connect.useDb(database).model('notifications', notificationSchema)

    try{
        const getnotifications = await Notification.find()
        if (getnotifications.length > 0 ) {
            res.json({status: 'ok', data: getnotifications, token: req.requestToken})
        }else{
            res.json({status: 'nothing found'})
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

//Final de la api. (Retorna: Notificaciones) -- Api end. (Return: Notifications)

//-------------------------------------------------------------------------

//Api que busca todas las notificaciones que no ha visto un usuario (Ingreso: ObjectId del usuario) -- Api that search all the unview notifications for a user (Input: User´s ObjectId)

notifications.get('/noviews/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Notification = connect.useDb(database).model('notifications', notificationSchema)
    const User = connect.useDb(database).model('users', userSchema)

    var validLimited = false
    try{
       const findUser = await User.findById(req.params.id)
       if(findUser){
            if(findUser.notificationLimited && findUser.notificationLimited == true){
                validLimited = true
            }
       }
       if(validLimited){
            try{
                const getnotifications = await Notification.find({employeId: findUser.linkLender}).sort({createdAt: -1}).limit(150)
                
                if (getnotifications.length > 0 ) {
                
                    let onlyYours = []
                    for (let i = 0; i < getnotifications.length; i++) {
                        const elementN = getnotifications[i];
                        let inps = true
                        for (let e = 0; e < getnotifications[i].views.length; e++) {
                            const element = getnotifications[i].views[e];
                            if (element == req.params.id) {
                                inps = false
                                break
                            }
                        }
                        if (inps) {
                            onlyYours.push(elementN)
                        }
                    }
                    
                    res.json({status: 'ok', data: onlyYours, token: req.requestToken})
                }else{
                    res.json({status: 'nothing found'})
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
       }else{
            try{
                const getnotifications = await Notification.find().sort({createdAt: -1}).limit(150)
                
                if (getnotifications.length > 0 ) {
                
                    let onlyYours = []
                    for (let i = 0; i < getnotifications.length; i++) {
                        const elementN = getnotifications[i];
                        let inps = true
                        for (let e = 0; e < getnotifications[i].views.length; e++) {
                            const element = getnotifications[i].views[e];
                            if (element == req.params.id) {
                                inps = false
                                break
                            }
                        }
                        if (inps) {
                            onlyYours.push(elementN)
                        }
                    }
                    
                    res.json({status: 'ok', data: onlyYours, token: req.requestToken})
                }else{
                    res.json({status: 'nothing found'})
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
       }
       
    }catch(err){
        console.log(err)
    }
    
})

//Final de la api. (Retorna: Notificaciones) -- Api end. (Return: Notifications)

//-------------------------------------------------------------------------

//Api que registra que un usuario vio sus notificaciones (Ingreso: ObjectId del usuario) -- Api that register that an user view its notifications (Input: User´s ObjectId)

notifications.get('/validateviews/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
    const Notification = connect.useDb(database).model('notifications', notificationSchema)

    var validLimited = false
    try{
       const findUser = await User.findById(req.params.id)
       if(findUser){
            if(findUser.notificationLimited && findUser.notificationLimited == true){
                validLimited = true
            }
       }
       if(validLimited){
            Notification.find({employeId: findUser.linkLender}).sort({createdAt: -1}).limit(150)
            .then(getNotifications => {
                if (getNotifications) {    
                    let onlyYours = []
                    for (let i = 0; i < getNotifications.length; i++) {
                        const elementN = getNotifications[i];
                        let inps = true
                        for (let e = 0; e < getNotifications[i].views.length; e++) {
                            const element = getNotifications[i].views[e];
                            if (element == req.params.id) {
                                inps = false
                            }
                        }
                        if (inps) {
                            onlyYours.push(elementN)
                            Notification.findByIdAndUpdate(elementN._id, {$push: { views: req.params.id}})
                            .then(ready => {})
                        }
                    }
                    res.json({status: 'ok', data: onlyYours, token: req.requestToken})
                }else{
                    res.json({status: 'nothing found'})
                }
            }).catch(err=>{
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
            })
    }else{
        Notification.find().sort({createdAt: -1}).limit(150)
        .then(getNotifications => {
            if (getNotifications) {    
                let onlyYours = []
                for (let i = 0; i < getNotifications.length; i++) {
                    const elementN = getNotifications[i];
                    let inps = true
                    for (let e = 0; e < getNotifications[i].views.length; e++) {
                        const element = getNotifications[i].views[e];
                        if (element == req.params.id) {
                            inps = false
                        }
                    }
                    if (inps) {
                        onlyYours.push(elementN)
                        Notification.findByIdAndUpdate(elementN._id, {$push: { views: req.params.id}})
                        .then(ready => {})
                    }
                }
                res.json({status: 'ok', data: onlyYours, token: req.requestToken})
            }else{
                res.json({status: 'nothing found'})
            }
        }).catch(err=>{
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
        })
    }
    }   
    catch(err){
        console.log(err)
    }   
    
})

//Final de la api. (Retorna: Notificaciones) -- Api end. (Return: Notifications)

//-------------------------------------------------------------------------

//Api que busca todas las notificaciones (max: 500) (Ingreso: Nullo) -- Api that search all the notifications (max: 500) (Input: Null)

notifications.get('/getall/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
    const Notification = connect.useDb(database).model('notifications', notificationSchema)

    var validLimited = false
    try{
       const findUser = await User.findById(req.params.id)
       if(findUser){
            if(findUser.notificationLimited && findUser.notificationLimited == true){
                validLimited = true
            }
       }

       if (validLimited) {
            try{
                const getnotifications = await Notification.find({employeId: findUser.linkLender}).sort({createdAt: -1}).limit(500)
                if (getnotifications.length > 0 ) {
                    res.json({status: 'ok', data: getnotifications, token: req.requestToken})
                }else{
                    res.json({status: 'nothing found'})
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
       }else{
        try{
            const getnotifications = await Notification.find().sort({createdAt: -1}).limit(500)
            if (getnotifications.length > 0 ) {
                res.json({status: 'ok', data: getnotifications, token: req.requestToken})
            }else{
                res.json({status: 'nothing found'})
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
       }
    }catch(err){
        console.log(err)
    }   
    
})

//Final de la api. (Retorna: Notificaciones) -- Api end. (Return: Notifications)

//-------------------------------------------------------------------------

//Api que crea una nueva notificación (Ingreso: branch, userName, userImg, detail, link) -- Api that create a new notification (Input: branch, userName, userImg, detail, link)

notifications.post('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const Notification = connect.useDb(database).model('notifications', notificationSchema)

    const dataNotify = {
        branch: req.body.branch,
        userName: req.body.userName,
        userImg: req.body.userImage,
        employeId: req.body.employeId,
        detail: req.body.detail,
        link: req.body.link
    }

    try{
        const register = await Notification.create(dataNotify)
        if (register) {
            res.json({status: 'ok', data: register})
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

//Final de la api. (Retorna: Datos de la notificacion) -- Api end. (Return: Notification´s data)

module.exports = notifications