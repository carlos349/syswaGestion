const express = require('express')
const mails = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const clientSchema = require('../models/Clients')
const dateSchema = require('../models/Dates')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
const cors = require('cors')

mails.use(cors())


//input - params id - pasar id
//output - status, data and token
mails.get('/sendMailRegister/:id', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Client = conn.model('clients', clientSchema)

    try {
        const client = await Client.findById(req.params.id)
       
        if (client) {
            const mail = {
                from: 'kkprettynails.cl',
                to: client.email,
                subject: 'Ingreso a kkprettynails.cl',
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
                                    <h1 style="text-align: center;color:#172b4d;">Bienvenid@ </h1>
                                    <p style="text-align:left;margin-top:10px;font-size:24px;"> <strong>Hola ${client.firstName} ${client.lastName}.</p>
                                    <p style="text-align:left;font-size:13px;font-weight: 300;margin:auto;"><strong> 
                                        Nos alegra darte la bienvenida a nuestra comunidad de uñas lindas y sanas, por este medio te estaremos
                                        informando todas las novedades de nuestros servicios. <br><br>
                                        Cualquier consulta, no dudes en escribirnos, estaremos encantadas de atenderte.</strong>
                                    </p>
                                <div>
                            </center>
                        </div>
                        <div style="width: 100%;box-shadow: 0 2px 5px 0 rgba(0,0,0,.14);margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:#181d81;padding-bottom:8px;-webkit-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);-moz-box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);box-shadow: 0px -4px 11px 0px rgba(0,0,0,0.12);">
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
            const mailTwo = {
                from: "kkprettynails.cl",
                to: 'kkprettynails@gmail.com',
                subject: 'Cliente registrado',
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
                                    
                                    <p style="text-align:center;margin-top:10px;font-size:24px;">Nuevo cliente registrado</p>
                                    <p style="text-align:center;font-size:13px;font-weight: 300;margin:auto;">
                                        <strong> 
                                        nombre: ${client.firstName} ${client.lastName} <br>
                                        correo: ${client.email} <br>
                                    </p>
                                <div>
                            </center>
                        </div>
                    </div>
                `
            }
            try{
                const send = await Mails.sendMail(mail)
                try {
                    const sendtwo = await Mails.sendMail(mailTwo)
                    res.json({status: 'ok'})
                }
                catch(err){
                    res.send(err)
                }
            }catch(err){
                res.send(err)
            }
        }
    }catch(err) {
        res.send(err)
    }
})

module.exports = mails