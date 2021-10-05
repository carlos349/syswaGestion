const express = require('express')
const clients = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const key = require('../private/key-jwt');
const protectRoute = require('../securityToken/verifyToken')
const clientSchema = require('../models/Clients')
const dateSchema = require('../models/Dates')
const configurationSchema = require('../models/Configurations')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
// const dataClient = require('../lastClients')
const cors = require('cors')
clients.use(cors())

//input - none - nada
//output - status, data and token
clients.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Client = conn.model('clients', clientSchema)

    try {
        const getClients = await Client.find()
        if (getClients.length > 0) {
            res.json({status: 'ok', data: getClients, token: req.requestToken})
        }else{
            res.json({status: 'bad', data: getClients, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }

})

//input - params id, pasar id
//output - status, data and token
clients.get('/findOne/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Client = conn.model('clients', clientSchema)

    try {
        const getClient = await Client.findOne({_id: req.params.id})
        if (getClient) {
            res.json({status: 'ok', data: getClient, token: req.requestToken})
        }else{
            res.json({status: 'user does exist', data: getClient, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//input - params id, pasar id
//output - status, data and token
clients.get('/findOneWithoutToken/:email', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Client = conn.model('clients', clientSchema)

    try {
        const getClient = await Client.findOne({email: req.params.email}, {password: 0})
        if (getClient) {
            res.json({status: 'ok', data: getClient, token: req.requestToken})
        }else{
            res.json({status: 'user does exist', data: getClient, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//input - none - nada
//output - status
clients.get('/getEmails', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Client = conn.model('clients', clientSchema)

    try {
        const getClients = await Client.find()
        if (getClients.length > 0) {
            const emails = []
            for (const client of getClients) {
                emails.push(client.email)
            }
            const emailsString = emails.join(', ')
            res.json({status: 'ok', data: emailsString, token: req.requestToken})
        }else{
            res.json({status: 'bad', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//input - params id, pasar id
//output - status, data and token
// clients.get('/restoreClients', (req, res) => {
//     // const database = req.headers['x-database-connect'];
//     const conn = mongoose.createConnection('mongodb://localhost/kkprettynails-syswa', {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })

//     const Client = conn.model('clients', clientSchema)
//     const clients = dataClient
    
//     for (const client of clients) {
//         Client.create(client)
//         .then(ready => {})
//     }
//     res.json({status: 'ok'})
// })


//KKprettynails Gets

clients.get('/countClientsKK', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Client = conn.model('clients', clientSchema)

    try {
        const getClients = await Client.find().count()
        if (getClients.length > 0) {
            res.json({status: 'ok', data: getClients, token: req.requestToken})
        }else{
            res.json({status: 'bad', data: getClients, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//input - pasar id . pasar id
//output - status
clients.get('/sendMailChange/:id', (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    Client.findById(req.params.id)
    .then(client => {
        const mail = {
            from: "kkprettynails.cl",
            to: client.email,
            subject: 'Cambio de información',
            html: `
            <div style="width: 100%; padding:0;text-align:center;">
                <div style="width: 60%;height: 8vh;margin: auto;background-color: #fdd3d7;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);padding: 20px;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#172b4d;text-align:justify;-webkit-box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);-moz-box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);">
                    <div style="width: 100px;margin:auto;border-radius:55%;background-color:#f8f9fa;padding: 10px;">     
                        <img style="width: 100%;margin-bot:20px;" src="https://kkprettynails.cl/img/logokk.png" alt="Logo kkprettynails">
                    </div>
                </div>
                <div style="width: 100%;margin: auto;padding-top: 5%;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#172b4d;padding-bottom: 40px;">
                    <center>
                        <div style="width:60%;text-align: center;">
                            
                            <p style="text-align:center;margin-top:10px;font-size:24px;"> <strong>Estimado(a) ${client.firstName} ${client.lastName}.</p>
                            <p style="text-align:left;font-size:13px;font-weight: 300;width: 100%;margin:auto;border-top: 3px solid #fdd3d7 !important;padding-top: 20px;"><strong> Actualización de datos</strong> <br><br>
                                Queremos confirmar y verificar que los cambios que has ejecutado fueron realizados correctamente.
                                <br><br>
                                Nombre: ${client.firstName} ${client.lastName} <br>
                                E-mail: ${client.email}  <br>
                                Teléfono: ${client.phone} <br><br>
                                Cualquier consulta, no dudes en escribirnos, estaremos encantadas de atenderte.
                            </p>

                        
                        <div>
                    </center>
                </div>
                <div style="width: 100%;background-color: #f0f1f3;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#181d81;padding-bottom:8px;-webkit-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);-moz-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);">
                        <center>
                        <div style="width:100%;">
                            <center>
                            <p style="text-align:center;font-size:16px;"><strong> Contáctanos</strong></p>
                            <a  href="mailto:kkprettynails@gmail.com" style="margin-left:20px;text-decoration:none;"> 
                                <img style="width:4%;" src="https://kkprettynails.cl/img/mail.png" alt="Logo mail">
                            </a>
                            <a  href="https://www.instagram.com/kkprettynails/" style="margin-left:20px;text-decoration:none;">
                                <img style="width:4%;" src="https://kkprettynails.cl/img/ig.png" alt="Logo ig">
                            </a>
                            <a  href="https://api.whatsapp.com/send?phone=56972628949&text=&source=&data=&app_absent=" style="margin-left:20px;text-decoration:none;">
                                <img style="width:4%;" src="https://kkprettynails.cl/img/ws.png" alt="Logo ws">
                            </a>
                            <a  href="https://kkprettynails.cl" style="margin-left:20px;text-decoration:none;">
                                <img style="width:4%;" src="https://kkprettynails.cl/img/web.png" alt="Logo web">
                            </a>
                            <a  href="https://goo.gl/maps/m5rVWDEiPj7q1Hxh9" style="margin-left:20px;text-decoration:none;">
                                <img style="width:4%;" src="https://kkprettynails.cl/img/market.png" alt="Logo web">
                            </a>
                            </center>
                        </div>
                        </center>
                    </div>
            </div>
            `
        }
        Mails.sendMail(mail)
        .then(send => {
            console.log(send)
        }).catch(err => {
            console.log(err)
        })
        res.json({status: 'ok'})
    }).catch(err => {
        res.send(err)
    })
})

//input - form with firstName, lastName, email, phone, instagram, birthday, recomendador . formulario con firstName, lastName, email, phone, instagram, birthday, recomendador
//output - status and token
clients.post('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    var finalRecommender = req.body.recommender == null ? 'Ninguno' : req.body.recommender
    const today = new Date()
    var birthday = req.body.birthday != '' ? new Date(req.body.birthday) : ''

    const clientData = {
        historical: [],
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        block: false,
        email: req.body.email,
        password: '',
        phone: req.body.phone,
        codeRescue: '',
        instagram: req.body.instagram,
        attends: 0,
        idRecommender: req.body.idRecommender,
        recommender: finalRecommender, 
        recommendations: 0,
        lastAttend: today,
        createdAt: today,
        birthday: birthday,
        userImg: 'person_1.jpg'
    }

    try {
        const findClient = await Client.findOne({email: clientData.email})
        if (!findClient) {
            try{
                const createClient = await Client.create(clientData)
                res.json({status: 'client create', data: createClient, token: req.requestToken})
            }catch(err){
                res.send(err)
            }
        }else{
            res.json({status: 'client exist', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//input - form with client . formulario con cliente
//output - status, data and token
clients.post('/datesperclient', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Date = conn.model('clients', dateSchema)

    try {
        const findDates = await Date.find({
            $and: [{"client.name": req.body.client}, {confirmation: false}]
        })
        if (findDates.length > 0) {
            res.json({status: 'ok', data: findDates, token: req.requestToken})
        }else{
            res.json({status: 'bad', data: findDates, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

clients.post('/sendPromotionEmail', protectRoute, (req, res) => {

    const mail = {
        from: req.body.email,
        bcc: req.body.clients,
        subject: req.body.subject,
        html: req.body.html
    }

    try {
        Mails.sendMail(mail)
        res.json({status: 'ok'})
    }catch(err){
        res.send(err)
    }
})

//input - none - nada
//output - status
clients.post('/verifyBlackList', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Configuration = conn.model('configurations', configurationSchema)

    try {
        const findConfiguration = await Configuration.findOne({branch:req.body.branch})
        var valid = false
        for (const blackList of findConfiguration.blackList) {
            if (blackList.clientId == req.body.clientId) {
                valid = true
                break
            }
        }
        if (valid) {
            const getDay = findConfiguration.blockHour.filter(day => day.day == new Date().getDay())[0]
            var blocksFirst = []
            var splitHour = parseFloat(getDay.start.split(':')[0])
            var splitMinutes = getDay.start.split(':')[1]
            for (let i = 0; i < getDay.time / 15 + 1; i++) {
                if (i == 0) {
                    blocksFirst.push({
                        hour: getDay.start,
                        validator: false,
                        employes: []
                    })
                    splitMinutes = parseFloat(splitMinutes) + 15
                    splitHour = splitMinutes == 60 ? splitHour + 1 : splitHour
                    splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                }else{
                    blocksFirst.push({
                        hour: splitHour+':'+splitMinutes,
                        validator: false,
                        employes: []
                    })
                    splitMinutes = parseFloat(splitMinutes) + 15
                    splitHour = splitMinutes == 60 ? splitHour + 1 : splitHour
                    splitMinutes = splitMinutes == 60 ? '00' : splitMinutes
                }
            }
            res.json({status: 'in black list', data: blocksFirst})
        }else{
            res.json({status: 'not in black list'})
        }
    }catch(err){
        res.send(err)
    }
})

//input - form with user and pass. formulario con user y pass
//output - status and token
clients.post('/loginClient', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    const data = {
        user: req.body.user.toLowerCase(),
        password: req.body.pass
    }

    try {
        const findClient = await Client.find({email: data.user})
        if (findClient) {
            if(bcrypt.compareSync(data.password, user.password)){
                const payload = {
                    _id: findClient._id,
                    name: findClient.name,
                    mail: findClient.email,
                    phone: findClient.phone,
                    birthday: findClient.birthday,
                    userImage: findClient.userImage,
                    historical: findClient.historical,
                    recomends: findClient.recommendations
                }
                let token = jwt.sign(payload, key, {
                    expiresIn: 60 * 60 * 24
                })
                res.json({status: 'ok', token: token})
			}else{
				res.json({status: 'pass incorrecto'})
			}
        }else{
            res.json({status: 'user does exist'})
        }
    }catch(err){
        res.send(err)
    }
})

//input - form with data : { firstName, lastName, email, password, code, phone, datePicker, idRecommender } . formulario con data : { firstName, lastName, email, password, code, phone, datePicker, idRecommender }
//output - status and token
clients.post('/registerwithpass', (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    const data = req.body.data
    const email = data.email.toLowerCase()
    const client = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: email,
        password: data.password,
        phone: data.code+ ' '+data.phone,
        instagram: '',
        attends: 1,
        block: false, 
        codeRescue: '',
        idRecommender: '',
        recommender: '',
        recommendations: 0,
        lastAttend: new Date(),
        historical: [],
        createdAt: new Date(),
        birthday: data.datePicker,
        userImage: 'person_1.jpg'
    }

    Client.findOne({identidad: Client.identidad})
    .then(exist => {
        if (exist) {
            if (exist.password == '') {
                bcrypt.hash(client.password, 10, (err, hash) => {
                    client.password = hash
                    Client.findByIdAndUpdate(exist._id, {
                        $set: {
                            password: client.password,
                            correoCliente: data.code+' '+data.phone,
                            birthday: data.datePicker,
                            userImage: 'person_1.jpg'
                        }
                    })
                    .then(setPass => {
                        Cliente.findById(setPass._id)
                        .then(client => {
                            const payload = {
                                _id: client._id,
                                name: client.nombre,
                                mail: client.identidad,
                                phone: client.correoCliente,
                                birthday: client.birthday,
                                userImage: client.userImage,
                                historical: client.historical,
                                recomends: client.recomendaciones
                            }
                            let token = jwt.sign(payload, key, {
                                expiresIn: 60 * 60 * 24
                            })
                            res.json({status: 'ok', token: token})
                        })
                        .catch(err => {
                            res.send(err)
                        })
                    })
                    .catch(err => {
                        res.send(err)
                    })
                })
            }else{
                res.json({status: 'client already exist'})
            }
        }else{
            if (data.idRecommender != '') {
                Client.findById(data.idRecommender)
                .then(refer => {
                    client.recommender = refer.firstName + ' / ' + refer.email
                    client.idRecommender = data.idRecommender
                    bcrypt.hash(client.password, 10, (err, hash) => {
                        client.password = hash
                        Client.create(client)
                        .then(createClient => {
                            const payload = {
                                _id: createClient._id,
                                firstName: createClient.firstName,
                                lastName: createClient.lastName,
                                mail: createClient.email,
                                phone: createClient.phone,
                                birthday: createClient.birthday,
                                userImage: createClient.userImage,
                                historical: createClient.historical,
                                recomends: createClient.recommendations
                            }
                            let token = jwt.sign(payload, key, {
                                expiresIn: 60 * 60 * 24
                            })
                            res.json({status: 'ok', token: token})
                        })
                        .catch(err => {
                            res.send(err)
                        })
                    })
                })
                .catch(err => {
                    res.send(err)
                })
            }else{
                bcrypt.hash(client.password, 10, (err, hash) => {
                    client.password = hash
                    Client.create(client)
                    .then(createClient => {
                        const payload = {
                            _id: createClient._id,
                            firstName: createClient.firstName,
                            lastName: createClient.lastName,
                            mail: createClient.email,
                            phone: createClient.phone,
                            birthday: createClient.birthday,
                            userImage: createClient.userImage,
                            historical: createClient.historical,
                            recomends: createClient.recommendations
                        }
                        let token = jwt.sign(payload, key, {
                            expiresIn: 60 * 60 * 24
                        })
                        res.json({status: 'ok', token: token})
                    })
                    .catch(err => {
                        res.send(err)
                    })
			    })
            }
        }
    })
    .catch(err => {
        res.send(err)
    })
})

//input - form with code and password . formulario con code and password
//output - status and token
clients.post('/rescueChange', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)
    try {
        const findClient = await Client.findOne({
            codeRescue: req.body.code
        })
        if (findClient) {
            bcrypt.hash(req.body.password, 10, async (err, hash) => {
                try {
                    const changePass = await Client.findByIdAndUpdate(findClient._id, {
                        $set: {password: hash}
                    })
                    if (changePass) {
                        res.json({status: 'ok'})
                    }else{
                        res.json({status: 'bad'})
                    }
                }catch(err){
                    res.send(err)
                }
            })
        }else{
            res.json({status: 'code not found'})
        }
    }catch(err){
        res.send(err)
    }
})

//input - params id . pasar id
//output - status and token
clients.delete('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    try {   
        const deleteClient = await Client.findByIdAndDelete(req.params.id)
        res.json({status: 'ok', token: req.requestToken})
    }catch(err){
        res.send(err)
    }
})

//input - params id, form with firstName, lastName, email, phone, instagram . pasar id, formulario con  firstName, lastName, email, phone, instagram
//output - status and token
clients.put('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    try {
        const findClient = await Client.findOne({
            email: req.body.email
        })
        if (!findClient) {
            try {
                
                const updateClient = await Client.findByIdAndUpdate(req.params.id, {
                    $set: {
                      firstName: req.body.firstName,
                      lastName: req.body.lastName,
                      email: req.body.email,
                      phone: req.body.phone,
                      instagram: req.body.instagram
                    }
                })
                if (updateClient) {
                    res.json({status: 'update client', token: req.requestToken})
                }
            }catch(err) {
                res.send(err)
            }
        }else{
            if (findClient._id == req.params.id) {
                try {
                    const updateClient = await Client.findByIdAndUpdate(req.params.id, {
                        $set: {
                          firstName:req.body.firstName,
                          lastName:req.body.lastName,
                          email:req.body.email,
                          phone: req.body.phone,
                          instagram: req.body.instagram
                        }
                    })
                    if (updateClient) {
                        try{
                            const clientNew = await Client.findById(updateClient._id)
                            res.json({status: 'update client', token: req.requestToken})
                        }catch(err){
                            res.send(err)
                        }
                    }
                } catch(err) {
                    res.send(err)
                }
            }else{
                res.json({status: 'client does exist'})
            }
        }
    }catch(err){
        res.send(err)
    }
})

clients.put('/changeImage/:id', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    try {
        const change = await Client.findByIdAndUpdate(req.params.id, {
            $set: {
                userImage: req.body.img+'.png'
            }
        })
        if (change) {
            try {
                const client = await Client.findById(req.params.id)
                const payload = {
                    _id: client._id,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    mail: client.email,
                    phone: client.phone,
                    birthday: client.birthday,
                    userImage: client.userImage,
                    historical: client.historical
                }
                let token = jwt.sign(payload, key, {
                    expiresIn: 60 * 60 * 24
                })
                res.json({status: 'ok', token: token})
            }catch(err){
                res.send(err)
            }
        }
    }catch (err){
        res.send(err)
    }
})

//input - params id, form with lastPass and newPass . pasar id, formulario con lastPass y newPass
//output - status
clients.put('/changePass/:id', (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    Client.findById(req.params.id)
    .then(client => {
        if (client) {
            if(bcrypt.compareSync(req.body.lastPass, client.password)){
                bcrypt.hash(req.body.newPass, 10, (err, hash) => {
				    const newpass = hash
                    Client.findByIdAndUpdate(req.params.id, {
                        $set: {
                            password: newpass
                        }
                    })
                    .then(changePass => {
                        const date = new Date()
                        if (date.getDate() < 10) {
                            var one = "0" + date.getDate()
                        }
                        else {
                            var one = date.getDate()
                        }
                        if (date.getMonth() < 10 ) {
                            var two = "0" + date.getMonth()
                        }
                        else{
                            var two = date.getMonth()
                        }
                        const goodDate = one+"-"+two+"-"+date.getFullYear() 
                        const mail = {
                            from: "kkprettynails.cl",
                            to: changePass.email,
                            subject: 'Cambio su contraseña',
                            html: `
                            <div style="width: 100%; padding:0;text-align:center;">
                                <div style="width: 60%;height: 8vh;margin: auto;background-color: #fdd3d7;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);padding: 20px;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#172b4d;text-align:justify;-webkit-box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);-moz-box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);">
                                    <div style="width: 100px;margin:auto;border-radius:55%;background-color:#f8f9fa;padding: 10px;">     
                                        <img style="width: 100%;margin-bot:20px;" src="https://kkprettynails.cl/img/logokk.png" alt="Logo kkprettynails">
                                    </div>
                                </div>
                                <div style="width: 100%;margin: auto;padding-top: 5%;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#172b4d;padding-bottom: 40px;">
                                    <center>
                                        <div style="width:60%;text-align: center;">
                                            <p style="text-align:center;margin-top:10px;font-size:24px;"> <strong>Estimado(a) ${changePass.firstName} ${changePass.lastName}.</p>
                                            <p style="text-align:left;font-size:13px;font-weight: 300;width: 100%;margin:auto;border-top: 3px solid #fdd3d7 !important;padding-top: 20px;"><strong> 
                                                Confirmamos el cambio de clave realizado por ti, con fecha ${goodDate} <br><br> Para volver a ingresar como usuario registrado solo debes ingresar tu correo electrónico y nueva clave
                                                personal. <br><br><br> Cualquier consulta, no dudes en escribirnos, estaremos encantadas de atenderte.
                                            </strong>
                                            </p>
                                        <div>
                                    </center>
                                </div>
                                <div style="width: 100%;background-color: #f0f1f3;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);margin: auto;padding: 5px;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#172b4d;padding-bottom:5px;-webkit-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);-moz-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);">
                                    <center>
                                    <div style="width:100%;">
                                        <center>
                                        <p style="text-align:center;font-size:16px;">Contáctanos.</p>
                                        <a href="mailto:kkprettynails@gmail.com"><img style="width:5%;margin-left:20px;" src="https://kkprettynails.cl/img/mail.png" alt=""></a>
                                        <a href="https://www.instagram.com/kkprettynails/?hl=es-la"><img style="width:5%;margin-left:20px;" src="https://kkprettynails.cl/img/ig.png" alt=""></a>
                                        <a href="https://wa.me/56972628949"><img style="width:5%;margin-left:20px;" src="https://kkprettynails.cl/img/ws.png" alt=""></a>
                                        <a href="https://kkprettynails.cl">
                                            <img style="width: 5%;margin-left:20px;" src="https://kkprettynails.cl/img/web.png" alt="">
                                        </a>
                                        <a  href="https://goo.gl/maps/m5rVWDEiPj7q1Hxh9" style="margin-left:20px;text-decoration:none;">
                                            <img style="width:4%;" src="https://kkprettynails.cl/img/market.png" alt="Logo web">
                                        </a>
                                        </center>
                                    </div>
                                    </center>
                                </div>
                            </div>`
                        }
                        
                        Mails.sendMail(mail)
                        .then(send => {
                            console.log(send)
                        }).catch(err => {
                            console.log(err)
                        })
                        res.json({status: 'ok'})
                    }).catch(err => {
                        res.send(err)
                    })
			    })
            }else{
                res.json({status: 'bad'})
            }
        }
    }).catch(err => {
        res.send(err)
    })
})

//input - params email . pasar email
//output - status
clients.put('/rescuePass/:email', async (req, res, next) => { 
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const Client = conn.model('clients', clientSchema)

    try {
        const findClient = await Client.findOne({
            email: req.params.email
        })
        
        if (!findClient) {
            res.json({status: 'client does exist'})   
        }else{
                try {
                    const date = new Date()
                    const code = date.getTime()+'?'+Math.floor(Math.random() * (9999 - 1000)) + 1000
                    const updateClient = await Client.findOneAndUpdate({email: req.params.email}, {
                        $set: {
                          codeRescue: code,
                        }
                    })
                    if (updateClient) {
                        const mail = {
                            from: "kkprettynails.cl",
                            to: req.params.email,
                            subject: 'Recuperación de contraseña',
                            html: `
                            <div style="width: 100%; padding:0;text-align:center;">
                                <div style="width: 60%;height: 8vh;margin: auto;background-color: #fdd3d7;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);padding: 20px;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#172b4d;text-align:justify;-webkit-box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);-moz-box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);box-shadow: 0px 6px 8px -8px rgba(0,0,0,0.73);">
                                    <div style="width: 100px;margin:auto;border-radius:55%;background-color:#f8f9fa;padding: 10px;">     
                                        <img style="width: 100%;margin-bot:20px;" src="https://kkprettynails.cl/img/logokk.png" alt="Logo kkprettynails">
                                    </div>
                                </div>
                                <div style="width: 100%;margin: auto;padding-top: 5%;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#172b4d;padding-bottom: 40px;">
                                    <center>
                                        <div style="width:100%;text-align: center;">
                                            <h1 style="text-align: center;color:#172b4d;">Bienvenid@ </h1>
                                            <p style="text-align:center;margin-top:10px;font-size:13px;"> <strong>Estimado(a) ${updateClient.firstName} ${updateClient.lastName}.</p>
                                            <p style="text-align:left;font-size:13px;font-weight: 300;text-align: center;width: 60%;margin:auto;"><strong> 
                                            Puedes recuperar tu contraseña por medio de este <a style="cursor: pointer;" href="https://kkprettynails.cl/#/servicios?code=${code}" class="text-center accLog">ENLACE</a> o por medio del siguiente boton: </strong>
                                            </p>

                                            <a style="display: inline-block;
                                            font-weight: 400;
                                            background: #605B56 !important;
                                            text-decoration: none;
                                            color: white;
                                            text-align: center;
                                            vertical-align: middle;
                                            -webkit-user-select: none;
                                            -moz-user-select: none;
                                            -ms-user-select: none;
                                            user-select: none;
                                            margin-top: 5%;
                                            border: 1px solid transparent;
                                            padding: 0.375rem 0.75rem;
                                            font-size: 1rem;
                                            line-height: 1.5;
                                            border-radius: 0.25rem;
                                            -webkit-transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;
                                            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;
                                            -o-transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                                            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                                            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;" href="https://kkprettynails.cl/#/servicios?code=${code}" class="text-center ">Cambiar contraseña</a> <br><br><br>

                                            <p style="text-align:left;font-size:13px;font-weight: 300;text-align: center;width: 60%;margin:auto;"><strong> <br>
                                            Este link solo podrá ser utilizado una sola vez. Si usted no realizó esta acción, ignore este correo. <br><br> Cualquier consulta, no dudes en escribirnos, estaremos encantadas de atenderte. </strong>
                                            </p>
                                        <div>
                                    </center>
                                </div>
                                <div style="width: 100%;background-color: #f0f1f3;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#181d81;padding-bottom:8px;-webkit-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);-moz-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);">
                                    <center>
                                    <div style="width:100%;">
                                        <center>
                                        <p style="text-align:center;font-size:16px;"><strong> Contáctanos</strong></p>
                                        <a  href="mailto:kkprettynails@gmail.com" style="margin-left:20px;text-decoration:none;"> 
                                            <img style="width:4%;" src="https://kkprettynails.cl/img/maill.png" alt="Logo mail">
                                        </a>
                                        <a  href="https://www.instagram.com/kkprettynails/" style="margin-left:20px;text-decoration:none;">
                                            <img style="width:4.4%;" src="https://kkprettynails.cl/img/ig.png" alt="Logo ig">
                                        </a>
                                        <a  href="https://api.whatsapp.com/send?phone=56972628949&text=&source=&data=&app_absent=" style="margin-left:20px;text-decoration:none;">
                                            <img style="width:4%;" src="https://kkprettynails.cl/img/ws.png" alt="Logo ws">
                                        </a>
                                        <a  href="https://kkprettynails.cl" style="margin-left:20px;text-decoration:none;">
                                            <img style="width:4%;" src="https://kkprettynails.cl/img/web.png" alt="Logo web">
                                        </a>
                                        <a  href="https://goo.gl/maps/m5rVWDEiPj7q1Hxh9" style="margin-left:20px;text-decoration:none;">
                                            <img style="width:4%;" src="https://kkprettynails.cl/img/market.png" alt="Logo web">
                                        </a>
                                        </center>
                                    </div>
                                    </center>
                                </div>
                            </div>
                            `
                        }
                        try{
                            const send = await Mails.sendMail(mail)
                            res.json({status: 'ok'})
                        }
                        catch(err){
                            console.log(err)
                        }
                    }
                }catch(err) {
                    res.send(err)
                }
        }
    } catch(err) {
        res.send(err)
    }
})

module.exports = clients