const express = require('express')
const users = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const userSchema = require('../models/Users')
const credentials = require('../private/private-credentials')
const bcrypt = require('bcrypt')
const email = require('../modelsMail/Mails')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const uploadS3 = require('../common-midleware/index')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
users.use(cors())

//here is come all users
users.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const User = conn.model('users', userSchema)
    try {
        const getUsers = await User.find()
        if (getUsers.length > 0) {
            res.json({status: 'ok', data: getUsers, token: req.requestToken})
        }else{
            res.json({status: 'users does exist'})
        }
    }catch(err){
        res.send(err)
    }
})

//
users.get('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const User = conn.model('users', userSchema)
    try{
        const findUser = await User.findById(req.params.id, {password: 0})
        if (findUser) {
            res.json({status: 'ok', data: findUser, token: req.requestToken})
        }else{
            res.json({status: 'user does exist'})
        }
    }catch(err){
        res.send(err)
    }
})

users.post('/register', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const User = conn.model('users', userSchema)

    const today = new Date()
    const userData = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
        branch: req.body.branch,
		email: req.body.email.toLowerCase(),
		password: req.body.password,
		about: '',
		status: 2,
		access: [],
		linkLender: '',
		userImage: '',
		LastAccess: today,
		createdAt: today
	}

    User.findOne({
        email: userData.email
    })
    .then(findUser => {
        if (!findUser) {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                userData.pasword = hash
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
        req.send(err)
    })
})

users.post('/sendNewPass', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const User = conn.model('users', userSchema)

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
			res.json({status: 'bad'})
			console.log(err)
		}
	}else{
		res.json({status: 'user does exist'})
	}
})

users.post('/editData/:id', protectRoute, uploadS3.single("image"), async (req, res, next) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const User = conn.model('users', userSchema)

	const id = req.params.id
	const firstName = req.body.first_name  
	const lastName = req.body.last_name 
	const mail = req.body.email
	const about = req.body.about
	if(req.file){
		const images = req.file.filename
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
            res.json({status: change, image: images, token: req.requestToken})
        }catch(err){
            res.send(err)
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
            res.json({status: change, image: '', token: req.requestToken})
        }catch(err){
            res.send(err)
        }
	}
})
module.exports = users