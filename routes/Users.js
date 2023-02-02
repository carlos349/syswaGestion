const express = require('express')
const users = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const userSchema = require('../models/Users')
const employeSchema = require('../models/Employes')
const credentialSchema = require('../models/userCrendentials')
const bcrypt = require('bcrypt')
const email = require('../modelsMail/Mails')
const LogService = require('../logService/logService')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const uploadS3 = require('../common-midleware/index')
const key = require('../private/key-jwt');
const mailCredentials = require('../private/mail-credentials')
const root = require('../private/user-root')
const Mails = new email(mailCredentials)
users.use(cors())
const connect = require('../mongoConnection/conectionInstances')

//generador de super usuario - super user generator

users.post('/createUserCertificate', async (req, res, next) => {
	const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
    const UserCredential = connect.useDb(database).model('credentials', credentialSchema)
    try {
        const getCredentials = await UserCredential.findOne({credential: req.body.secretKey})
        if (getCredentials){
            const access = [
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
                            "editar",
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
            const userData = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                branch: req.body.branch,
                password: '',
                status: "Gerente",
                access: access,
                linkLender: '',
                userImage: '',
                LastAccess: new Date(),
                date: new Date()
            }
            User.findOne({
                email: req.body.email
            })
            .then(user => {
                if(!user){
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        userData.password = hash
                        User.create(userData)
                        .then(user => {
                            res.json({status: 'ok'})
                        })
                        .catch(err => {
                            res.send('error: ' + err)
                        })
                    })
                }else{
                    res.json({error: 'User already exist'})
                }
            })
            .catch(err => {
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
            })
        }else{
            res.json({status: 'ok', data: 'incorrect credentials'})
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
        const dataLog = await Log.createLog()
        res.send('failed api with error, '+ dataLog.error)
    }
    
})

//output - data and token
users.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    

    const User = connect.useDb(database).model('users', userSchema)
    try {
        const getUsers = await User.find({},{password: 0})
        if (getUsers.length > 0) {
            res.json({status: 'ok', data: getUsers, token: req.requestToken})
        }else{
            res.json({status: 'users does exist'})
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

//input - pasar id . params id
//output - data and token
users.get('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
    try{
        const findUser = await User.findById(req.params.id, {password: 0})
        if (findUser) {
            res.json({status: 'ok', data: findUser, token: req.requestToken})
        }else{
            res.json({status: 'user does exist'})
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

users.get('/getbylinklender/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
    try{
        const findUser = await User.findOne({linkLender: req.params.id})
        if (findUser) {
            res.json({status: 'ok', data: findUser.userImage, token: req.requestToken})
        }else{
            res.json({status: 'user does not have lender', data: "no"})
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

//input - email
//output - ok, y envia un correo al usuario con una nueva contraseña provisional . ok, and mail for user with a new provisional password
users.post('/sendNewPass', async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)

	const email = req.body.email
	const user = await User.findOne({email: email})
	if (user) {
		const newPass = Date.now()
		const hash = await bcrypt.hash(newPass.toString(), 10)
		if (!hash) {
			res.status(404).send('Error en encriptado')
		}
		const change = await User.findByIdAndUpdate(user._id, {
			$set: {password: hash}
		})
		if (!change) {
			res.status(404).send('User not found')
		}
		const mail = {
            from: "kkprettynails",
            to: email,
            subject: 'Contraseña provicional, SYSWA Gestión',
            html: `<div style="width: 50%;margin: auto;background-color: #f8f9fe;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);padding: 20px;font-family: 'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#32325d;text-align:justify;">     
                <h1>Estimado ${user.first_name} ${user.last_name}, esta es su clave provisoria. Al ingresar a nuestro sistema debe modificar dicha clave en "Perfil de usuario".</h1>
				<h3 style="color:#32325d !important;">Contaseña: ${newPass} </h3>
                <style>h3{color:#32325d;}</style>
            </div>`
        }
		try{
        	const send = await Mails.sendMail(mail)
			res.json({status: 'ok'})
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
	}else{
		res.json({status: 'user does exist'})
	}
})

//input pasar id y formulario con first_name, last_name, email, about, image . params id, and form with first_name, last_name, email, about, image
//output ok, token
users.post('/editData/:id', protectRoute, uploadS3.single("image"), async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)

	const id = req.params.id
	const firstName = req.body.first_name  
	const lastName = req.body.last_name 
	const mail = req.body.email
	const about = req.body.about
	if(req.file){
		const images = req.file.location
        try {
            const change = await User.findByIdAndUpdate(id, {
                $set: {
                    first_name: firstName,
                    last_name: lastName,
                    email: mail,
                    about: about,
                    userImage: images
                }
            })
            res.json({status: 'ok', image: images, token: req.requestToken})
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
        try {
            const change = await User.findByIdAndUpdate(id, {
                $set: {
                    first_name: firstName,
                    last_name: lastName,
                    email: mail,
                    about: about
                }
            })
            res.json({status: 'ok', image: '', token: req.requestToken})
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
})

//input - formulario con first_name, last_name, branch, email, password, image . form with first_name, last_name, branch, email, password, image
//output - ok, data and token
users.post('/registerUser', protectRoute, uploadS3.single("image"), (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
    
    const today = new Date()
    var userData = {}
    if(req.file){
        userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            branch: req.body.branch,
            email: req.body.email.toLowerCase(),
            password: '',
            about: '',
            status: "Debe asignar",
            access: [],
            linkLender: '',
            userImage: req.file.location,
            LastAccess: today,
            createdAt: today
        }
    }else{
        userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            branch: req.body.branch,
            email: req.body.email.toLowerCase(),
            password: '',
            about: '',
            status: "Debe asignar",
            access: [],
            linkLender: '',
            userImage: '',
            LastAccess: today,
            createdAt: today
        }
    }
    
    User.findOne({
        email: userData.email
    })
    .then(findUser => {
        if (!findUser) {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                userData.password = hash
                User.create(userData)
                .then(userCreated => {
                    res.json({status: 'ok', data: userCreated, token: req.requestToken})
                }).catch(err => { 
                    res.send(err)
                })
            })
        }else{
            res.json({status: 'user already exist'})
        }
    }).catch(err => {
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
})

//input - formulario con email, password . form with email and password
//output - status, token and access
users.post('/login', (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
    if (req.body.email.toLowerCase() == root.login.user && req.body.password == root.login.pass ) {
        const payload = root.payload
        let token = jwt.sign(payload, key, {
            expiresIn: 60 * 60 * 24
        })
        res.json({token: token, status: root.payload.status, access: root.payload.access})
    }else{
        const today = new Date()
        User.findOne({
            email: req.body.email.toLowerCase()
        })
        .then(user => {
            if(user){
                if(bcrypt.compareSync(req.body.password, user.password)){
                    User.findByIdAndUpdate(user._id, {
                        $set: {
                            LastAccess: today
                        }
                    })
                    .then(access => {
                        const payload = {
                            _id: user._id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            branch: user.branch,
                            email: user.email,
                            about: user.about,
                            status: user.status,
                            access: user.access,
                            userImage: user.userImage,
                            lastAccess: user.lastAccess,
                            linkLender: user.linkLender
                        }
                        let token = jwt.sign(payload, key, {
                            expiresIn: 60 * 60 * 24
                        })
                        res.json({token: token, status: user.status, access: user.access})
                    })
                }else{
                    res.json({error: 'pass incorrecto'})
                }
            }else{
                res.json({error: 'User does not exist'})
            }
        })
        .catch(err => {
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
        })
    }
	
})

//input - params id . pasar id
// output - status and token
users.delete('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)

    try{
        const deleteUser = await User.findByIdAndRemove(req.params.id)
        if (deleteUser) {
            res.json({status: 'ok', token: req.requestToken})
        }else{
            res.json({status: 'users does exist'})
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
})

//input - params id and form status, employe . pasar id y formulario con status y employe
//output - status, data, and token
users.put('/changestatus/:id', protectRoute, async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
    const Employe = connect.useDb(database).model('employes', employeSchema)

	const status = req.body.status
	const employe = req.body.employe
    const routes = req.body.routes
    try{
        const update = await User.findByIdAndUpdate(req.params.id, { 
            $set: {
                status: status, 
                access: routes,
                linkLender: employe
            }
        })
        if (update) {
            const updateEmploye = await Employe.findByIdAndUpdate(employe, { 
                $set: {
                    users: update._id
                }
            })
            res.json({status: 'ok', data: update, token: req.requestToken})
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

//input - params id, form access . pasar id y formulario con access
//output - status and token
users.put('/editAccess/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
	const access = req.body.access
	try {
		const modifyAccess = await User.findByIdAndUpdate(req.params.id, {
			$set: {access: access}
		})
		if (modifyAccess) {
			const user = await User.findOne({ email: modifyAccess.email })
			if (user) {
				const payload = {
					_id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    branch: user.branch,
                    email: user.email,
                    about: user.about,
                    status: user.status,
                    access: user.access,
                    userImage: user.userImage,
                    LastAccess: user.LastAccess,
                    linkLender: user.linkLender
				}
				let token = jwt.sign(payload, key, {
					expiresIn: 60 * 60 * 24
				})
				res.json({status: 'ok', token: token})
			}
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
})

//input - params id, form newpass and lastpass . pasas id, formulario con newpass y lastpass
//output - status and token
users.put('/changePass/:id', protectRoute, async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)

	const id = req.params.id
	const newPass = req.body.newPass
	const lastPass = req.body.lastPass
    try{
        const compare = await User.findById(id)
        if (!compare) {
            res.status(404).send('User does exist')
        }else{
            if (bcrypt.compareSync(lastPass, compare.password)) {
                const hash = await bcrypt.hash(newPass, 10)
                if (!hash) {
                    res.status(404).send('Error en encriptado')
                }
                const change = await User.findByIdAndUpdate(id, {
                    $set: {
                        password: hash
                    }
                })
                if (!change) {
                    res.status(404).send('User not found')
                }
                res.json({status:'ok', token: req.requestToken})
            }else{
                res.json({status:'incorrect pass', token: req.requestToken})
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

module.exports = users