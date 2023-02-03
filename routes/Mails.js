const express = require('express')
const mails = express.Router()
const mongoose = require('mongoose')
const formats = require("../formats")
const protectRoute = require('../securityToken/verifyToken')
const clientSchema = require('../models/Clients')
const dateSchema = require('../models/Dates')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const saleSchema = require('../models/Sales')
const configurationSchema = require('../models/Configurations')
const Mails = new email(mailCredentials)
const cors = require('cors')
const connect = require('../mongoConnection/conectionInstances')
mails.use(cors())


//input - params id - pasar id
//output - status, data and token
mails.get('/sendMailRegister/:id', async (req, res) => {
  const database = req.headers['x-database-connect'];


  const Client = connect.useDb(database).model('clients', clientSchema)

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
                                    <a  href="http://kkspa.cl" style="margin-left:20px;text-decoration:none;">
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
      try {
        const send = await Mails.sendMail(mail)
        try {
          const sendtwo = await Mails.sendMail(mailTwo)
          res.json({ status: 'ok' })
        }
        catch (err) {
          res.send(err)
        }
      } catch (err) {
        res.send(err)
      }
    }
  } catch (err) {
    res.send(err)
  }
})

mails.post('/mailGiftCardKK', async (req, res) => {
  const mail = {
    from: "KK SPA",
    to: req.body.email,
    subject: "Gift Card KK SPA",
    html: `
      <!doctype html>
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <title>
            
          </title>
          <!--[if !mso]><!-- -->
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <!--<![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style type="text/css">
            #outlook a { padding:0; }
            body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
            table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
            img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
            p { display:block;margin:13px 0; }
          </style>
          <!--[if mso]>
          <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
          <!--[if lte mso 11]>
          <style type="text/css">
            .outlook-group-fix { width:100% !important; }
          </style>
          <![endif]-->
          
        <!--[if !mso]><!-->
          <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
          <style type="text/css">
            @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
  @import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
          </style>
        <!--<![endif]-->

      
          
      <style type="text/css">
        @media only screen and (max-width:480px) {
          .mj-column-per-100 { width:100% !important; max-width: 100%; }
        }
      </style>
      
    
          <style type="text/css">
          
          

      @media only screen and (max-width:480px) {
        table.full-width-mobile { width: 100% !important; }
        td.full-width-mobile { width: auto !important; }
      }
    
          </style>
          <style type="text/css">.hide_on_mobile { display: none !important;} 
          @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
          .hide_section_on_mobile { display: none !important;} 
          @media only screen and (min-width: 480px) { 
              .hide_section_on_mobile { 
                  display: table !important;
              } 

              div.hide_section_on_mobile { 
                  display: block !important;
              }
          }
          .hide_on_desktop { display: block !important;} 
          @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
          .hide_section_on_desktop { 
              display: table !important;
              width: 100%;
          } 
          @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
          
            p, h1, h2, h3 {
                margin: 0px;
            }

            a {
                text-decoration: none;
                color: inherit;
            }

            @media only screen and (max-width:480px) {

              .mj-column-per-100 { width:100%!important; max-width:100%!important; }
              .mj-column-per-100 > .mj-column-per-75 { width:75%!important; max-width:75%!important; }
              .mj-column-per-100 > .mj-column-per-60 { width:60%!important; max-width:60%!important; }
              .mj-column-per-100 > .mj-column-per-50 { width:50%!important; max-width:50%!important; }
              .mj-column-per-100 > .mj-column-per-40 { width:40%!important; max-width:40%!important; }
              .mj-column-per-100 > .mj-column-per-33 { width:33.333333%!important; max-width:33.333333%!important; }
              .mj-column-per-100 > .mj-column-per-25 { width:25%!important; max-width:25%!important; }

              .mj-column-per-100 { width:100%!important; max-width:100%!important; }
              .mj-column-per-75 { width:100%!important; max-width:100%!important; }
              .mj-column-per-60 { width:100%!important; max-width:100%!important; }
              .mj-column-per-50 { width:100%!important; max-width:100%!important; }
              .mj-column-per-40 { width:100%!important; max-width:100%!important; }
              .mj-column-per-33 { width:100%!important; max-width:100%!important; }
              .mj-column-per-25 { width:100%!important; max-width:100%!important; }
          }</style>
          
        </head>
        <body style="background-color:#FFFFFF;">
          
          
        <div style="background-color:#FFFFFF;">
          
        
        <!--[if mso | IE]>
        <table
          align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
        >
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      
        
        <div style="margin:0px auto;max-width:600px;">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                  <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  
          <tr>
        
              <td
                class="" style="vertical-align:top;width:600px;"
              >
            <![endif]-->
              
        <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
          
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          
              <tr>
                <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                  
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
          <tbody>
            <tr>
              <td style="width:162px;">
                
        <img height="auto" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/61291a432d117/1630084357.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="162">
      
              </td>
            </tr>
          </tbody>
        </table>
      
                </td>
              </tr>
            
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-family: Cabin, sans-serif; font-size: 20px;">Estimado(a) ${req.body.name}</span></p>
  <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px; font-family: Cabin, sans-serif;">Hemos recibido tu solicitud de comprar. Pronto el equipo de KK SPA se comunicar&aacute;</span></p>
  <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px; font-family: Cabin, sans-serif;">contigo para efectuar la compra de tu Gift Card.</span></p></div>
      
                </td>
              </tr>
            
              <tr>
                <td style="font-size:0px;padding:10px 0px;padding-top:10px;padding-right:0px;padding-bottom:10px;padding-left:0px;word-break:break-word;">
                  
        <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 2px #E9F0F8; font-size: 1; margin: 0px auto; width: 100%;">
        </p>
        
        <!--[if mso | IE]>
          <table
            align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 2px #E9F0F8;font-size:1;margin:0px auto;width:600px;" role="presentation" width="600px"
          >
            <tr>
              <td style="height:0;line-height:0;">
                &nbsp;
              </td>
            </tr>
          </table>
        <![endif]-->
      
      
                </td>
              </tr>
            
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Cabin, sans-serif; font-size: 16px;">A continuaci&oacute;n te dejamos la informaci&oacute;n de tu pedido</span></p>
  <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Cabin, sans-serif; font-size: 16px;">Nombre: ${req.body.name}</span></p>
  <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Cabin, sans-serif; font-size: 16px;">Servicios:&nbsp; ${req.body.services}</span></p>
  <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Cabin, sans-serif; font-size: 16px;">Monto:&nbsp; ${req.body.amount}</span></p>
  <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Cabin, sans-serif; font-size: 16px;">Tel&eacute;fono:  ${req.body.phone}</span></p>
  <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Cabin, sans-serif; font-size: 16px;">Email: ${req.body.email}</span></p>
  <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Cabin, sans-serif; font-size: 16px;">Fecha:  ${req.body.date}</span></p></div>
            </td>
          </tr>
        </table>
      
        </div>
      
            <!--[if mso | IE]>
              </td>
            
          </tr>
        
                    </table>
                  <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        
        <table
          align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
        >
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      
        
        <div style="background:#E9F0F8;background-color:#E9F0F8;margin:0px auto;max-width:600px;">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#E9F0F8;background-color:#E9F0F8;width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                  <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  
          <tr>
        
              <td
                class="" style="vertical-align:top;width:600px;"
              >
            <![endif]-->
              
        <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
          
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          
              <tr>
                <td align="left" style="font-size:0px;padding:8px 15px 3px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-family: Cabin, sans-serif; font-size: 14px;">Cont&aacute;ctanos</span></p></div>
      
                </td>
              </tr>
            
              <tr>
                <td align="center" style="font-size:0px;padding:3px 3px 3px 3px;word-break:break-word;">
                  
        
      <!--[if mso | IE]>
        <table
          align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
        >
          <tr>
        
                <td>
              <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                  
        <tr>
          <td style="padding:4px;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border-radius:3px;width:38px;">
              <tr>
                <td style="font-size:0;height:38px;vertical-align:middle;width:38px;">
                  <a href="http://mailto:kkprettynails@gmail.com" target="_blank" style="color: #0000EE;">
                      <img height="38" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/61291a432d117/1630085242.jpg" style="border-radius:3px;display:block;" width="38">
                    </a>
                  </td>
                </tr>
            </table>
          </td>
          
        </tr>
      
                </table>
              <!--[if mso | IE]>
                </td>
              
                <td>
              <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                  
        <tr>
          <td style="padding:4px;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border-radius:3px;width:38px;">
              <tr>
                <td style="font-size:0;height:38px;vertical-align:middle;width:38px;">
                  <a href="https://www.instagram.com/kkprettynails/?hl=es-la" target="_blank" style="color: #0000EE;">
                      <img height="38" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/61291a432d117/1630085267.jpg" style="border-radius:3px;display:block;" width="38">
                    </a>
                  </td>
                </tr>
            </table>
          </td>
          
        </tr>
      
                </table>
              <!--[if mso | IE]>
                </td>
              
            </tr>
          </table>
        <![endif]-->
      
      
                </td>
              </tr>
            
              <tr>
                <td align="left" style="font-size:0px;padding:3px 15px 3px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><a href="https://goo.gl/maps/GhvcDBH1ppBDae1KA" style="color: #0000EE;"><span style="font-family: Cabin, sans-serif; font-size: 12px;">Av. Pedro de Valdivia 3474 Caracol &Ntilde;u&ntilde;oa, Local 25-B &Ntilde;u&ntilde;oa, Chile.</span></a></p></div>
      
                </td>
              </tr>
            
        </table>
      
        </div>
      
            <!--[if mso | IE]>
              </td>
            
          </tr>
        
                    </table>
                  <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        <![endif]-->
      
      
        </div>
      
        </body>
      </html>
    `
  }
  const mailTwo = {
    from: "kkprettynails.cl",
    to: 'kkprettynails@gmail.com',
    subject: 'Pedido Gift Card',
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
                        
                        <p style="text-align:center;margin-top:10px;font-size:24px;">Nuevo pedido de Gift Card</p>
                        <p style="text-align:center;font-size:13px;font-weight: 300;margin:auto;">
                            <strong> 
                            Nombre: ${req.body.name}<br>
                            Correo: ${req.body.email} <br>
                            Teléfono: ${req.body.phone}
                        </p>
                    <div>
                </center>
            </div>
        </div>
    `
  }

  try {
    const send = await Mails.sendMail(mail)
    try {
      const sendtwo = await Mails.sendMail(mailTwo)
      res.json({ status: 'ok' })
    }
    catch (err) {
      res.send(err)
    }
  } catch (err) {
    res.send(err)
  }
})

mails.post('/welcome', (req, res) => {
  const mail = {
    from: 'Syswa gestion no-reply@syswa.net',
    to: req.body.email,
    subject: 'Bienvenido a SYSWA',
    html: `
        <!doctype html>
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
          <head>
            <title>
              
            </title>
            <!--[if !mso]><!-- -->
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <!--<![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style type="text/css">
              #outlook a { padding:0; }
              body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
              table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
              img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
              p { display:block;margin:13px 0; }
            </style>
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <!--[if lte mso 11]>
            <style type="text/css">
              .outlook-group-fix { width:100% !important; }
            </style>
            <![endif]-->
            
          <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css?family=Roboto:400,700" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
            <style type="text/css">
              @import url(https://fonts.googleapis.com/css?family=Roboto:400,700);
    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
    @import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
            </style>
          <!--<![endif]-->
    
        
            
        <style type="text/css">
          @media only screen and (max-width:480px) {
            .mj-column-per-100 { width:100% !important; max-width: 100%; }
          }
        </style>
        
      
            <style type="text/css">
            
            
    
        @media only screen and (max-width:480px) {
          table.full-width-mobile { width: 100% !important; }
          td.full-width-mobile { width: auto !important; }
        }
      
            </style>
            <style type="text/css">.hide_on_mobile { display: none !important;} 
            @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
            .hide_section_on_mobile { display: none !important;} 
            @media only screen and (min-width: 480px) { 
                .hide_section_on_mobile { 
                    display: table !important;
                } 
    
                div.hide_section_on_mobile { 
                    display: block !important;
                }
            }
            .hide_on_desktop { display: block !important;} 
            @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
            .hide_section_on_desktop { display: table !important;} 
            @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
            
              p, h1, h2, h3 {
                  margin: 0px;
              }
    
              a {
                  text-decoration: none;
                  color: inherit;
              }
    
              @media only screen and (max-width:480px) {
    
                .mj-column-per-100 { width:100%!important; max-width:100%!important; }
                .mj-column-per-100 > .mj-column-per-75 { width:75%!important; max-width:75%!important; }
                .mj-column-per-100 > .mj-column-per-60 { width:60%!important; max-width:60%!important; }
                .mj-column-per-100 > .mj-column-per-50 { width:50%!important; max-width:50%!important; }
                .mj-column-per-100 > .mj-column-per-40 { width:40%!important; max-width:40%!important; }
                .mj-column-per-100 > .mj-column-per-33 { width:33.333333%!important; max-width:33.333333%!important; }
                .mj-column-per-100 > .mj-column-per-25 { width:25%!important; max-width:25%!important; }
    
                .mj-column-per-100 { width:100%!important; max-width:100%!important; }
                .mj-column-per-75 { width:100%!important; max-width:100%!important; }
                .mj-column-per-60 { width:100%!important; max-width:100%!important; }
                .mj-column-per-50 { width:100%!important; max-width:100%!important; }
                .mj-column-per-40 { width:100%!important; max-width:100%!important; }
                .mj-column-per-33 { width:100%!important; max-width:100%!important; }
                .mj-column-per-25 { width:100%!important; max-width:100%!important; }
            }</style>
            
          </head>
          <body style="background-color:#FFFFFF;">
            
            
          <div style="background-color:#FFFFFF;">
            
          
          <!--[if mso | IE]>
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
          
          <div style="margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="vertical-align:top;width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                    
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
            <tbody>
              <tr>
                <td style="width:336px;">
                  
          <img height="auto" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/610483e1288ab/1627685887.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="336">
        
                </td>
              </tr>
            </tbody>
          </table>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
          
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
          
          <div style="margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="vertical-align:top;width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td align="left" style="font-size:0px;padding:15px 15px 10px 15px;word-break:break-word;">
                    
          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><strong><span style="font-family: Roboto, Tahoma, sans-serif; font-size: 14px;">Bienvenido a <span style="color: #172b4d;">SYSWA</span> ${req.body.firstName}!</span></strong></p></div>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
          
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
          
          <div style="margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="vertical-align:top;width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td align="left" style="font-size:0px;padding:5px 15px 5px 15px;word-break:break-word;">
                    
          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 14px;">Gracias por gestionar tu negocio con nosotros en <strong>SYSWA</strong> gestion.</span></p></div>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
          
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
          
          <div style="margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="vertical-align:top;width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td style="font-size:0px;padding:10px 0px;padding-top:10px;padding-right:0px;padding-left:0px;word-break:break-word;">
                    
          <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
          </p>
          
          <!--[if mso | IE]>
            <table
               align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:600px;" role="presentation" width="600px"
            >
              <tr>
                <td style="height:0;line-height:0;">
                  &nbsp;
                </td>
              </tr>
            </table>
          <![endif]-->
        
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
          
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
          
          <div style="margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="vertical-align:top;width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border:none;vertical-align:top;" width="100%">
            
                <tr>
                  <td align="left" style="font-size:0px;padding:15px 15px 5px 15px;word-break:break-word;">
                    
          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 13px;"><strong>Este es tu correo de ingreso.</strong></span></p></div>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
          
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
          
          <div style="margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="vertical-align:top;width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border:1px #172b4dba solid;vertical-align:top;" width="100%">
            
                <tr>
                  <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                    
          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 12px;"><strong>Direcci&oacute;n de correo electronico</strong>: <span style="font-size: 13px;">${req.body.email}</span></span></p></div>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
          
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
          
          <div style="margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="vertical-align:top;width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                    
          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 13px;"><strong>Ten en cuenta que:</strong></span></p></div>
        
                  </td>
                </tr>
              
                <tr>
                  <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                    
          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Roboto, Tahoma, sans-serif; font-size: 13px;"><em>1. Debes mantener los datos de tu cuenta protegidos.</em></span></p>
    <p style="font-family: Ubuntu, Helvetica, Arial;">&nbsp;</p>
    <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Roboto, Tahoma, sans-serif; font-size: 13px;"><em>2. No compartas informaci&oacute;n de tus datos con otras personas.</em></span></p>
    <p style="font-family: Ubuntu, Helvetica, Arial;">&nbsp;</p>
    <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-family: Roboto, Tahoma, sans-serif; font-size: 13px;"><em>3. Si sospecha de alguna actividad inusual avisanos de inmediato</em></span></p></div>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
          
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
          
          <div style="margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="vertical-align:top;width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td style="font-size:0px;padding:10px 99px;padding-top:10px;padding-right:99px;padding-left:99px;word-break:break-word;">
                    
          <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
          </p>
          
          <!--[if mso | IE]>
            <table
               align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:402px;" role="presentation" width="402px"
            >
              <tr>
                <td style="height:0;line-height:0;">
                  &nbsp;
                </td>
              </tr>
            </table>
          <![endif]-->
        
        
                  </td>
                </tr>
              
                <tr>
                  <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                    
          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-family: Roboto, Tahoma, sans-serif;"><span style="font-size: 13px;">Ya puedes comenzar a gestionar tu negocio con</span> <strong><span style="font-size: 14px;">SYSWA</span></strong></span></p></div>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
          
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          <![endif]-->
    
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#F8F8F9;background-color:#F8F8F9;width:100%;">
            <tbody>
              <tr>
                <td>
                  
            
          <!--[if mso | IE]>
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
          >
            <tr>
              <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
          <![endif]-->
        
            
          <div style="Margin:0px auto;max-width:600px;">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;">
                    <!--[if mso | IE]>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    
            <tr>
          
                <td
                   class="" style="width:600px;"
                >
              <![endif]-->
                
          <div class="mj-column-per-100 outlook-group-fix" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
            <!--[if mso | IE]>
            <table  role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tr>
            
                  <td
                     style="vertical-align:top;width:150px;"
                  >
                  <![endif]-->
                    
          <div class="mj-column-per-25 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:25%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                    
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
            <tbody>
              <tr>
                <td style="width:38px;">
                  
            <a href="mailto:syswainfo@gmail.com" target="_blank">
              
          <img height="auto" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/5f6a6e46dec34/1600810634.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="38">
        
            </a>
          
                </td>
              </tr>
            </tbody>
          </table>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
                  <!--[if mso | IE]>
                  </td>
                  
                  <td
                     style="vertical-align:top;width:150px;"
                  >
                  <![endif]-->
                    
          <div class="mj-column-per-25 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:25%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                    
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
            <tbody>
              <tr>
                <td style="width:38px;">
                  
            <a href="https://www.instagram.com/syswanet/" target="_blank">
              
          <img height="auto" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/5f6a6e46dec34/1600810643.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="38">
        
            </a>
          
                </td>
              </tr>
            </tbody>
          </table>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
                  <!--[if mso | IE]>
                  </td>
                  
                  <td
                     style="vertical-align:top;width:150px;"
                  >
                  <![endif]-->
                    
          <div class="mj-column-per-25 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:25%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                    
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
            <tbody>
              <tr>
                <td style="width:38px;">
                  
            <a href="https://api.whatsapp.com/send?phone=56985826974&text=&source=&data=&app_absent=" target="_blank">
              
          <img height="auto" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/5f6a6e46dec34/1600810652.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="38">
        
            </a>
          
                </td>
              </tr>
            </tbody>
          </table>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
                  <!--[if mso | IE]>
                  </td>
                  
                  <td
                     style="vertical-align:top;width:150px;"
                  >
                  <![endif]-->
                    
          <div class="mj-column-per-25 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:25%;">
            
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
            
                <tr>
                  <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                    
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
            <tbody>
              <tr>
                <td style="width:38px;">
                  
            <a href="http://syswa.net/" target="_blank">
              
          <img height="auto" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/5f6a6e46dec34/1600810704.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="38">
        
            </a>
          
                </td>
              </tr>
            </tbody>
          </table>
        
                  </td>
                </tr>
              
          </table>
        
          </div>
        
                  <!--[if mso | IE]>
                  </td>
                  
              </tr>
              </table>
            <![endif]-->
          </div>
        
              <!--[if mso | IE]>
                </td>
              
            </tr>
          
                      </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            
          </div>
        
            
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          <![endif]-->
        
          
                </td>
              </tr>
            </tbody>
          </table>
        
        
          </div>
        
          </body>
        </html>
        `
  }
  Mails.sendMail(mail)
    .then(send => {
      console.log(send)
    }).catch(err => {
      console.log(err)
    })
  res.json({ status: 'ok' })
})

mails.get('/salemail/:id', protectRoute, async (req, res) => {
  const database = req.headers['x-database-connect'];

  const Sale = connect.useDb(database).model('sales', saleSchema)
  const Configuration = connect.useDb(database).model('configurations', configurationSchema)
  var logo = ''


  try {
    const findSale = await Sale.findById(req.params.id)
    if (findSale) {
      try {
        const getConfigurations = await Configuration.findOne({
          branch: findSale.branch
        })
        logo = getConfigurations.bussinessLogo
      } catch (err) {
        res.send(err)
      }
      var vuelt = ((findSale.totals.total - findSale.totals.totalPay) * (-1))

      let dateFormat = new Date(findSale.createdAt)
      dateFormat = dateFormat.getDate() + "-" + (dateFormat.getMonth() + 1) + "-" + dateFormat.getFullYear()

      let val4 = (findSale.totals.total / 1).toFixed(2).replace('.', ',')
      val4 = val4.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

      let val5 = (findSale.totals.totalPay / 1).toFixed(2).replace('.', ',')
      val5 = val5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

      let val6 = (vuelt / 1).toFixed(2).replace('.', ',')
      val6 = val6.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

      var tableTd = ''

      findSale.items.forEach(element => {
        let val = (element.price / 1).toFixed(2).replace('.', ',')
        val = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

        let val2 = (element.additionalsTotal / 1).toFixed(2).replace('.', ',')
        val2 = val2.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

        let val3 = (element.totalItem / 1).toFixed(2).replace('.', ',')
        val3 = val3.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

        tableTd = tableTd + `<tr>
            <td>${element.item.name}</td>
            <td>${element.type == 'service' ? 'Servicio' : "producto"}</td>
            <td>$ ${val}</td>
            <td>${element.type == 'service' ? "$ " + val2 : element.quantityProduct}</td>
            <td>${element.discount} %</td>
            <td>$ ${val3}</td>
          </tr>`
      });
      var tablePay = ''
      findSale.typesPay.forEach(element => {
        let val7 = (element.total / 1).toFixed(2).replace('.', ',')
        val7 = val7.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

        tablePay = tablePay + `<tr>
            <td>${dateFormat}</td>
            <td>${element.type}</td>
            <td>$ ${val7}</td>
          </tr>`
      });

      const mail = {
        from: 'SYSWA no-reply@syswa.net',
        to: findSale.client.email,
        subject: 'Detalles de tu venta',
        html: `
            <!doctype html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
              <head>
                <title>
                  
                </title>
                <!--[if !mso]><!-- -->
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <!--<![endif]-->
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style type="text/css">
                  #outlook a { padding:0; }
                  body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
                  table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
                  img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
                  p { display:block;margin:13px 0; }
                </style>
                <!--[if mso]>
                <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                <!--[if lte mso 11]>
                <style type="text/css">
                  .outlook-group-fix { width:100% !important; }
                </style>
                <![endif]-->
                
              <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
                <style type="text/css">
                  @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
        @import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
                </style>
              <!--<![endif]-->
        
            
                
            <style type="text/css">
              @media only screen and (max-width:480px) {
                .mj-column-per-100 { width:100% !important; max-width: 100%; }
        .mj-column-per-50 { width:50% !important; max-width: 50%; }
        .mj-column-per-33 { width:33.333333% !important; max-width: 33.333333%; }
              }
            </style>
            
          
                <style type="text/css">
                
                
        
            @media only screen and (max-width:480px) {
              table.full-width-mobile { width: 100% !important; }
              td.full-width-mobile { width: auto !important; }
            }
          
                </style>
                <style type="text/css">.hide_on_mobile { display: none !important;} 
                @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
                .hide_section_on_mobile { display: none !important;} 
                @media only screen and (min-width: 480px) { 
                    .hide_section_on_mobile { 
                        display: table !important;
                    } 
        
                    div.hide_section_on_mobile { 
                        display: block !important;
                    }
                }
                .hide_on_desktop { display: block !important;} 
                @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
                .hide_section_on_desktop { display: table !important;} 
                @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
                
                  p, h1, h2, h3 {
                      margin: 0px;
                  }
        
                  a {
                      text-decoration: none;
                      color: inherit;
                  }
        
                  .tableItems {
                    font-family: arial, sans-serif;
                    border-collapse: collapse;
                    width: 100%;
                  }
        
                  .tableItems td, th {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                  }
        
                  .tableItems tr:nth-child(even) {
                    background-color: #dddddd;
                  }
        
                  @media only screen and (max-width:480px) {
        
                    .mj-column-per-100 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-100 > .mj-column-per-75 { width:75%!important; max-width:75%!important; }
                    .mj-column-per-100 > .mj-column-per-60 { width:60%!important; max-width:60%!important; }
                    .mj-column-per-100 > .mj-column-per-50 { width:50%!important; max-width:50%!important; }
                    .mj-column-per-100 > .mj-column-per-40 { width:40%!important; max-width:40%!important; }
                    .mj-column-per-100 > .mj-column-per-33 { width:33.333333%!important; max-width:33.333333%!important; }
                    .mj-column-per-100 > .mj-column-per-25 { width:25%!important; max-width:25%!important; }
        
                    .mj-column-per-100 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-75 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-60 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-50 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-40 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-33 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-25 { width:100%!important; max-width:100%!important; }
                }</style>
                
              </head>
              <body style="background-color:#FFFFFF;">
                
                
              <div style="background-color:#FFFFFF;">
                
              
              <!--[if mso | IE]>
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:4px 0px 4px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:600px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                        
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                <tbody>
                  <tr>
                    <td style="width:300px;">
                      
              <img height="auto" src="${logo}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
            
                    </td>
                  </tr>
                </tbody>
              </table>
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Hola ${findSale.client.firstName}! Este es el detalle de tu venta.</span></strong></p></div>
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td style="font-size:0px;padding:10px 10px;padding-top:10px;padding-right:10px;word-break:break-word;">
                        
              <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
              </p>
              
              <!--[if mso | IE]>
                <table
                  align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
                >
                  <tr>
                    <td style="height:0;line-height:0;">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              <![endif]-->
            
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 14px;">Detalle de la venta (ID: ${findSale.uuid})</span></strong></p>
        <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;">Fecha: ${dateFormat}</span></p></div>
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 0px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 16px;"><strong>Resumen de pagos</strong></span></p></div>
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td style="font-size:0px;padding:10px 10px;padding-top:10px;padding-right:10px;padding-bottom:10px;word-break:break-word;">
                        
              <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
              </p>
              
              <!--[if mso | IE]>
                <table
                  align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
                >
                  <tr>
                    <td style="height:0;line-height:0;">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              <![endif]-->
            
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:300px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-50 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:50%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 15px 10px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;"><strong>Cliente</strong>: ${findSale.client.firstName} ${findSale.client.lastName}</span></p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                      class="" style="vertical-align:top;width:300px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-50 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:50%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 15px 10px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;"><strong>Correo</strong>: ${findSale.client.email}</span></p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:199.999998px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 15px 10px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 16px;"><strong>Monto total</strong>: </span></p>
        <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 16px;">${val4}</span></p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                      class="" style="vertical-align:top;width:199.999998px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 15px 15px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 16px;"><strong>Monto pagado</strong>:&nbsp;</span></p>
        <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 16px;">${val5}</span></p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                      class="" style="vertical-align:top;width:199.999998px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 15px 15px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 16px;"><strong>Vuelto</strong>:&nbsp;</span></p>
        <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 16px;">${val6}</span></p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:1px 0px 1px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:600px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 0px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: left;"><span style="font-size: 14px;"><strong>Abonos</strong></span></p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:600px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td style="font-size:0px;padding:10px 10px;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;word-break:break-word;">
                        
              <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
              </p>
              
              <!--[if mso | IE]>
                <table
                  align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
                >
                  <tr>
                    <td style="height:0;line-height:0;">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              <![endif]-->
            
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:5px 0px 5px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:199.999998px;"
                    >
                  <![endif]-->

                  <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
        
            <tr>
              <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;">
        <table class="tableItems">
          <tr>
            <th>Fecha</th>
            <th>Medio de pago</th>
            <th>Total</th>
          </tr>
          ${tablePay}
        </table>
      </div>
    
              </td>
            </tr>
          
      </table>
    
      </div>
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 15px 10px 15px;word-break:break-word;">
                        
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 0px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: left;"><span style="font-size: 14px;"><strong>&Iacute;tems</strong></span></p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                      class="" style="vertical-align:top;width:199.999998px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 15px 10px 15px;word-break:break-word;">
              
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                      class="" style="vertical-align:top;width:199.999998px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 15px 10px 15px;word-break:break-word;">
                        
              
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:600px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td style="font-size:0px;padding:10px 10px;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;word-break:break-word;">
                        
              <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
              </p>
              
              <!--[if mso | IE]>
                <table
                  align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
                >
                  <tr>
                    <td style="height:0;line-height:0;">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              <![endif]-->
            
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:600px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;">
                <table class="tableItems">
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Precio</th>
                    <th>Adicional / Cantidad</th>
                    <th>Descuento</th>
                    <th>Total</th>
                  </tr>
                  
                  ${tableTd}
                </table>
              </div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              <![endif]-->
            
            
              </div>
            
              </body>
            </html>
            `
      }
      Mails.sendMail(mail)
        .then(send => {
          console.log(send)
          res.json({ status: 'ok' })
        }).catch(err => {
          console.log(err)
        })

    }
  } catch (err) {
    res.send(err)
  }
})

mails.get('/resolveMails', async (req, res) => {

  const Configuration = connect.useDb("kkprettynails-syswa").model('configurations', configurationSchema)
  const date = connect.useDb("kkprettynails-syswa").model('dates', dateSchema)
  
  
  try {
    const dates = await date.find({
      $and: [
        { createdAt: { $gte: '02-04-2023 00:00', $lte: '05-20-2023 24:00' } },
        { branch: '612f185da6a0df026bb599c5' }
      ]
    })
  
  
    const configurations = await Configuration.find({ branch: '612f185da6a0df026bb599c5' })
    
    for (const datee of dates) {
      const formatDate = {
        date: `${datee.start.split(' ')[0].split('-')[1]}-${datee.start.split(' ')[0].split('-')[0]}-${datee.start.split(' ')[0].split('-')[2]}`,
        start: datee.start.split(' ')[1],
        end: datee.end.split(' ')[1],
      }
      var micro = ''
      for (const key in datee.microServices) {
        const microservice = datee.microServices[key]
        if (datee.microServices[microservice + 1]) {
          micro = micro + microservice.name + ' - '
        } else {
          micro = micro + microservice.name
        }
      }
      const branchData = {
        name: '',
        email: '',
        phone: {},
        image: '',
        location: '',
        route: ''
      }
      const branchFind = configurations.find(element => element.branch == datee.branch)
      if (branchFind) {
        branchData.name = branchFind.businessName
        branchData.email = branchFind.businessEmail
        branchData.phone = branchFind.businessPhone
        branchData.image = branchFind.bussinessLogo
        branchData.location = branchFind.businessLocation
        branchData.route = branchFind.bussinessRoute
        branchData.datesPolicies = branchFind.datesPolicies
      }

     

      if (datee.client) {
        const mail = {
          from: branchData.name + ' no-reply@syswa.net',
          to: datee.client.email,
          bcc: branchData.email,
          subject: 'Recordatorio de tu agendamiento en ' + branchData.name,
          html: `<!doctype html>
                  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                    <head>
                      <title>
                        
                      </title>
                      <!--[if !mso]><!-- -->
                      <meta http-equiv="X-UA-Compatible" content="IE=edge">
                      <!--<![endif]-->
                      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style type="text/css">
                        #outlook a { padding:0; }
                        body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
                        table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
                        img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
                        p { display:block;margin:13px 0; }
                      </style>
                      <!--[if mso]>
                      <xml>
                      <o:OfficeDocumentSettings>
                        <o:AllowPNG/>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                      </o:OfficeDocumentSettings>
                      </xml>
                      <![endif]-->
                      <!--[if lte mso 11]>
                      <style type="text/css">
                        .outlook-group-fix { width:100% !important; }
                      </style>
                      <![endif]-->
                      
                    <!--[if !mso]><!-->
                      <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
              <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
                      <style type="text/css">
                        @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
              @import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
                      </style>
                    <!--<![endif]-->
              
                  
                      
                  <style type="text/css">
                    @media only screen and (max-width:480px) {
                      .mj-column-per-100 { width:100% !important; max-width: 100%; }
              .mj-column-per-33 { width:33.333333333333336% !important; max-width: 33.333333333333336%; }
              .mj-column-per-50 { width:50% !important; max-width: 50%; }
              .mj-column-per-25 { width:25% !important; max-width: 25%; }
                    }
                  </style>
                  
                
                      <style type="text/css">
                      
                      
              
                  @media only screen and (max-width:480px) {
                    table.full-width-mobile { width: 100% !important; }
                    td.full-width-mobile { width: auto !important; }
                  }
                
                      </style>
                      <style type="text/css">.hide_on_mobile { display: none !important;} 
                      @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
                      .hide_section_on_mobile { display: none !important;} 
                      @media only screen and (min-width: 480px) { 
                          .hide_section_on_mobile { 
                              display: table !important;
                          } 
              
                          div.hide_section_on_mobile { 
                              display: block !important;
                          }
                      }
                      .hide_on_desktop { display: block !important;} 
                      @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
                      .hide_section_on_desktop { display: table !important;} 
                      @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
                      
                        p, h1, h2, h3 {
                            margin: 0px;
                        }
              
                        a {
                            text-decoration: none;
                            color: inherit;
                        }
              
                        @media only screen and (max-width:480px) {
              
                          .mj-column-per-100 { width:100%!important; max-width:100%!important; }
                          .mj-column-per-100 > .mj-column-per-75 { width:75%!important; max-width:75%!important; }
                          .mj-column-per-100 > .mj-column-per-60 { width:60%!important; max-width:60%!important; }
                          .mj-column-per-100 > .mj-column-per-50 { width:50%!important; max-width:50%!important; }
                          .mj-column-per-100 > .mj-column-per-40 { width:40%!important; max-width:40%!important; }
                          .mj-column-per-100 > .mj-column-per-33 { width:33.333333%!important; max-width:33.333333%!important; }
                          .mj-column-per-100 > .mj-column-per-25 { width:25%!important; max-width:25%!important; }
              
                          .mj-column-per-100 { width:100%!important; max-width:100%!important; }
                          .mj-column-per-75 { width:100%!important; max-width:100%!important; }
                          .mj-column-per-60 { width:100%!important; max-width:100%!important; }
                          .mj-column-per-50 { width:100%!important; max-width:100%!important; }
                          .mj-column-per-40 { width:100%!important; max-width:100%!important; }
                          .mj-column-per-33 { width:100%!important; max-width:100%!important; }
                          .mj-column-per-25 { width:100%!important; max-width:100%!important; }
                      }</style>
                      
                    </head>
                    <body style="background-color:#FFFFFF;">
                      
                      
                    <div style="background-color:#FFFFFF;">
                      
                    
                    <!--[if mso | IE]>
                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                    >
                      <tr>
                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                  
                    
                    <div style="margin:0px auto;max-width:600px;">
                      
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                        <tbody>
                          <tr>
                            <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                              <!--[if mso | IE]>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              
                      <tr>
                    
                          <td
                             class="" style="vertical-align:top;width:600px;"
                          >
                        <![endif]-->
                          
                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                      
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      
                          <tr>
                            <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                              
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                      <tbody>
                        <tr>
                          <td style="width:186px;">
                            
                    <img height="auto" src="${branchData.image}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="186">
                  
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  
                            </td>
                          </tr>
                        
                          <tr>
                            <td align="left" style="font-size:0px;padding:15px 15px 0px 15px;word-break:break-word;">
                              
                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><h2 style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">${branchData.name}</h2>
              <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">&nbsp;</p></div>
                  
                            </td>
                          </tr>
                        
                    </table>
                  
                    </div>
                  
                        <!--[if mso | IE]>
                          </td>
                        
                      </tr>
                    
                                </table>
                              <![endif]-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                    </div>
                  
                    
                    <!--[if mso | IE]>
                        </td>
                      </tr>
                    </table>
                    
                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                    >
                      <tr>
                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                  
                    
                    <div style="margin:0px auto;max-width:600px;">
                      
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                        <tbody>
                          <tr>
                            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                              <!--[if mso | IE]>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              
                      <tr>
                    
                          <td
                             class="" style="vertical-align:top;width:600px;"
                          >
                        <![endif]-->
                          
                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                      
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      
                          <tr>
                            <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                              
                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">${datee.client.name}, tu reserva fue recibida exitosamente</p></div>
                  
                            </td>
                          </tr>
                        
                          <tr>
                            <td style="font-size:0px;padding:10px 0px;padding-top:10px;word-break:break-word;">
                              
                    <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
                    </p>
                    
                    <!--[if mso | IE]>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:600px;" role="presentation" width="600px"
                      >
                        <tr>
                          <td style="height:0;line-height:0;">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    <![endif]-->
                  
                  
                            </td>
                          </tr>
                        
                    </table>
                  
                    </div>
                  
                        <!--[if mso | IE]>
                          </td>
                        
                      </tr>
                    
                                </table>
                              <![endif]-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                    </div>
                  
                    
                    <!--[if mso | IE]>
                        </td>
                      </tr>
                    </table>
                    
                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                    >
                      <tr>
                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                  
                    
                    <div style="margin:0px auto;max-width:600px;">
                      
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                        <tbody>
                          <tr>
                            <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                              <!--[if mso | IE]>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              
                      <tr>
                    
                          <td
                             class="" style="vertical-align:top;width:200px;"
                          >
                        <![endif]-->
                          
                    <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
                      
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      
                          <tr>
                            <td align="left" style="font-size:0px;padding:15px 0px 15px 0px;word-break:break-word;">
                              
                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 18px;">Detalles de agendamiento</span></p></div>
                  
                            </td>
                          </tr>
                        
                    </table>
                  
                    </div>
                  
                        <!--[if mso | IE]>
                          </td>
                        
                          <td
                             class="" style="vertical-align:top;width:200px;"
                          >
                        <![endif]-->
                          
                    <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
                      
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      
                          <tr>
                            <td style="font-size:0px;padding:37px 0px;padding-top:37px;word-break:break-word;">
                              
                    <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
                    </p>
                    
                    <!--[if mso | IE]>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:200px;" role="presentation" width="200px"
                      >
                        <tr>
                          <td style="height:0;line-height:0;">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    <![endif]-->
                  
                  
                            </td>
                          </tr>
                        
                    </table>
                  
                    </div>
                  
                        <!--[if mso | IE]>
                          </td>
                        
                          <td
                             class="" style="vertical-align:top;width:200px;"
                          >
                        <![endif]-->
                          
                    <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
                      
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      
                          <tr>
                            <td align="center" style="font-size:0px;padding:10px 10px 10px 10px;word-break:break-word;">
                              
                    
                   <!--[if mso | IE]>
                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                    >
                      <tr>
                    
                            <td>
                          <![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                              
                    <tr>
                      <td style="padding:4px;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border-radius:3px;width:50px;">
                          <tr>
                            <td style="font-size:0;height:50px;vertical-align:middle;width:50px;">
                              <a href="https://api.whatsapp.com/send?phone=${branchData.phone.countryCallingCode + branchData.phone.nationalNumber}&text=&source=&data=&app_absent=" target="_blank" style="color: #0000EE;">
                                  <img height="50" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/6114035a78f23/1628711480.jpg" style="border-radius:3px;display:block;" width="50">
                                </a>
                              </td>
                            </tr>
                        </table>
                      </td>
                      
                    </tr>
                  
                            </table>
                          <!--[if mso | IE]>
                            </td>
                          
                            <td>
                          <![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                              
                    <tr>
                      <td style="padding:4px;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border-radius:3px;width:50px;">
                          <tr>
                            <td style="font-size:0;height:50px;vertical-align:middle;width:50px;">
                              <a href="mailto:${branchData.email}" target="_blank" style="color: #0000EE;">
                                  <img height="50" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/6114035a78f23/1628712889.jpg" style="border-radius:3px;display:block;" width="50">
                                </a>
                              </td>
                            </tr>
                        </table>
                      </td>
                      
                    </tr>
                  
                            </table>
                          <!--[if mso | IE]>
                            </td>
                          
                        </tr>
                      </table>
                    <![endif]-->
                  
                  
                            </td>
                          </tr>
                        
                    </table>
                  
                    </div>
                  
                        <!--[if mso | IE]>
                          </td>
                        
                      </tr>
                    
                                </table>
                              <![endif]-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                    </div>
                  
                    
                    <!--[if mso | IE]>
                        </td>
                      </tr>
                    </table>
                    
                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                    >
                      <tr>
                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                  
                    <!-- DESDE AQUI -->
              
                    <div style="margin:0px auto; margin-top:10px;max-width:600px;">
                            
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                          <tbody>
                          <tr>
                              <td style="border:none;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                              <!--[if mso | IE]>
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              
                      <tr>
                      
                          <td
                              class="" style="vertical-align:top;width:600px;"
                          >
                          <![endif]-->
                          
                      <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                      
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#E9E9E9;vertical-align:top;" width="100%">
                      
                          <tr>
                              <td align="left" style="font-size:0px;padding:15px 15px 0px 15px;word-break:break-word;">
                              
                      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 12px;">${datee.services[0].name}</span></p>
                  <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 12px;">${formatDate.date} desde las <strong>${formatDate.start}</strong> hasta las <strong>${formatDate.end}</strong></span></p>
                  <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 12px;">Adicionales: ${micro}</span></p></div>
  
                              </td>
                          </tr>
                          
                          <tr>
                              <td style="font-size:0px;padding:10px 10px;padding-top:10px;word-break:break-word;">
                              
                      <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
                      </p>
                      
                      <!--[if mso | IE]>
                      <table
                          align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
                      >
                          <tr>
                          <td style="height:0;line-height:0;">
                              &nbsp;
                          </td>
                          </tr>
                      </table>
                      <![endif]-->
  
  
                              </td>
                          </tr>
                          
                      </table>
  
                      </div>
  
                          <!--[if mso | IE]>
                          </td>
                          
                      </tr>
                      
                                  </table>
                              <![endif]-->
                              </td>
                          </tr>
                          </tbody>
                      </table>
                      
                      </div>
  
                      
                      <!--[if mso | IE]>
                          </td>
                      </tr>
                      </table>
                      
                      <table
                      align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                      >
                      <tr>
                          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
  
                      
                      <div style="background:#E9E9E9;background-color:#E9E9E9;margin:0px auto;max-width:600px;">
                      
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#E9E9E9;background-color:#E9E9E9;width:100%;">
                          <tbody>
                          <tr>
                              <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                              <!--[if mso | IE]>
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              
                      <tr>
                      
                          <td
                              class="" style="vertical-align:top;width:300px;"
                          >
                          <![endif]-->
                          
                      <div class="mj-column-per-50 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:50%;">
                      
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#E9E9E9;vertical-align:top;" width="100%">
                      
                          <tr>
                              <td align="left" style="font-size:0px;padding:0px 15px 15px 15px;word-break:break-word;">
                              
                      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><strong>Empleado:</strong> ${datee.employe.name}</p>
                  <p style="font-family: Ubuntu, Helvetica, Arial;"><strong>Direcci&oacute;n: </strong>${branchData.location}</p></div>
  
                              </td>
                          </tr>
                          
                      </table>
  
                      </div>
  
                          <!--[if mso | IE]>
                          </td>
                          
                          <td
                              class="" style="vertical-align:top;width:150px;"
                          >
                          <![endif]-->
                          
                      <div class="mj-column-per-25 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:25%;">
                      
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      
                          <tr>
                              <td align="center" vertical-align="middle" style="font-size:0px;padding:0px 20px 20px 20px;word-break:break-word;">
                              
                      
  
                              </td>
                          </tr>
                          
                      </table>
  
                      </div>
  
                          <!--[if mso | IE]>
                          </td>
                          
                          <td
                              class="" style="vertical-align:top;width:150px;"
                          >
                          <![endif]-->
                          
                      <div class="mj-column-per-25 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:25%;">
                      
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      
                          <tr>
                              <td align="center" vertical-align="middle" style="font-size:0px;padding:0px 20px 20px 20px;word-break:break-word;">
                              
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                      <tr>
                          <td align="center" bgcolor="#e85034" role="presentation" style="border:none;border-radius:5px;cursor:auto;mso-padding-alt:9px 26px 9px 26px;background:#e85034;" valign="middle">
                          <a href="${branchData.route}/cancelarcita?id=${datee._id}" style="display: inline-block; background: #e85034; color: #ffffff; font-family: Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: normal; line-height: 15px; margin: 0; text-decoration: none; text-transform: none; padding: 9px 26px 9px 26px; mso-padding-alt: 0px; border-radius: 5px;" target="_blank">
                              <span style="font-size: 12px;">Cancelar</span>
                          </a>
                          </td>
                      </tr>
                      </table>
  
                              </td>
                          </tr>
                          
                      </table>
  
                      </div>
  
                          <!--[if mso | IE]>
                          </td>
                          
                      </tr>
                      
                                  </table>
                              <![endif]-->
                              </td>
                          </tr>
                          </tbody>
                      </table>
                      
                      </div>
                    
                  
                    <!-- HASTA AQUI -->
  
                    <!--POLITICAAAAAAAAAAAAS #####################################-->
  
              <div style="margin:0px auto;max-width:600px; margin-top: 70px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                      class="" style="vertical-align:top;width:300px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:0px 15px 0px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#282727;">
                
                ${branchData.datesPolicies}
              
              </div>
  
                      </td>
                    </tr>
                  
              </table>
  
              </div>
  
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                      class="" style="vertical-align:top;width:150px;"
                    >
                  <![endif]-->
                  
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                      class="" style="vertical-align:top;width:150px;"
                    >
                  <![endif]-->
  
                  
                    
              
  
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
  
              <!--POLITICAAAAAS #################################-->
              
                    
                    <!--[if mso | IE]>
                        </td>
                      </tr>
                    </table>
                    
                    <table
                       align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                    >
                      <tr>
                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                    <![endif]-->
                  
                    
                    <div style="margin:0px auto;max-width:600px;">
                      
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                        <tbody>
                          <tr>
                            <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                              <!--[if mso | IE]>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              
                      <tr>
                    
                          <td
                             class="" style="vertical-align:top;width:600px;"
                          >
                        <![endif]-->
                          
                    <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                      
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      
                          <tr>
                            <td style="font-size:0px;padding:47px 10px;padding-top:47px;word-break:break-word;">
                              
                    <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
                    </p>
                    
                    <!--[if mso | IE]>
                      <table
                         align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
                      >
                        <tr>
                          <td style="height:0;line-height:0;">
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                    <![endif]-->
                  
                  
                            </td>
                          </tr>
                        
                          <tr>
                            <td align="center" style="font-size:0px;padding:15px 0px 15px 0px;word-break:break-word;">
                              
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                      <tbody>
                        <tr>
                          <td style="width:204px;">
                            
                      <a href="Links pagina de siswa" target="_blank" style="color: #0000EE;">
                        
                    <img height="auto" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/6114035a78f23/1628706676.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="204">
                  
                      </a>
                    
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  
                            </td>
                          </tr>
                        
                          <tr>
                            <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                              
                    <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">Copyright 2021 | ${branchData.name} | Todos los derechos reservados</p></div>
                  
                            </td>
                          </tr>
                        
                    </table>
                  
                    </div>
                  
                        <!--[if mso | IE]>
                          </td>
                        
                      </tr>
                    
                                </table>
                              <![endif]-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                    </div>
                  
                    
                    <!--[if mso | IE]>
                        </td>
                      </tr>
                    </table>
                    <![endif]-->
                  
                  
                    </div>
                  
                    </body>
                  </html> `
        }

        try {
          Mails.sendMail(mail)
        } catch (err) {
          console.log(err)
        }
      }
    }
  } catch (err) {
    console.log(err)
  }
})

mails.post('/dateMail', async (req, res) => {
  const client = req.body.name
  const branch = req.body.branch
  const branchId = req.body.branchId
  var data = req.body.data
  const IDS = req.body.id

  const date = req.body.date
  const servicesFinal = req.body.servicesFinal
  const valid = req.body.valid
  const dateCompare = formats.changeDate(date)
  const database = req.headers['x-database-connect'];


  const Configuration = connect.useDb(database).model('configurations', configurationSchema)

  try {
    const getConfigurations = await Configuration.findOne({
      branch: branchId
    })
    if (getConfigurations) {
      var services = ''
      var validMail = false
      if ((new Date(dateCompare).getDate() - 1) == new Date().getDate() && new Date(dateCompare).getMonth() == new Date().getMonth() || new Date(dateCompare).getDate() == new Date().getDate() && new Date(dateCompare).getMonth() == new Date().getMonth()) {
        validMail = true
      }
      for (const key in servicesFinal) {
        const element = servicesFinal[key]
        var micro = ''
        if (valid) {
          if (element.microServiceSelect) {
            for (let i = 0; i < element.microServiceSelect.length; i++) {
              const elementM = element.microServiceSelect[i];
              if (element.microServiceSelect[i + 1]) {
                micro = micro + elementM.name + ' - '
              } else {
                micro = micro + elementM.name
              }
            }
          }

        } else {
          for (let i = 0; i < data.microServices.length; i++) {
            const elementM = data.microServices[i];
            if (data.microServices[i + 1]) {
              micro = micro + elementM.name + ' - '
            } else {
              micro = micro + elementM.name
            }
          }
        }
        var ifConfirm = validMail ? `
              <td align="center" bgcolor="#2dce89" role="presentation" style="border:none;border-radius:5px;cursor:auto;mso-padding-alt:9px 26px 9px 26px;background:#2dce89;" valign="middle">
              <a href="${getConfigurations.bussinessRoute}/confirmacioncita?id=${IDS[key]._id}" style="display: inline-block; background: #2dce89; color: #ffffff; font-family: Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: normal; line-height: 15px; margin: 0; text-decoration: none; text-transform: none; padding: 9px 26px 9px 26px; mso-padding-alt: 0px; border-radius: 5px;" target="_blank">
                  <center>
                    <span style="font-size: 12px;">Confirmar</span>
                  </center>
              </a>
              </td>` : ``
        services = services + `
              <div style="margin:0px auto; margin-top:10px;max-width:600px;">
                          
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                  <tr>
                    <td style="border:none;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                      <!--[if mso | IE]>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      
              <tr>
            
                  <td
                    class="" style="vertical-align:top;width:600px;"
                  >
                <![endif]-->
                  
            <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
              
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#E9E9E9;vertical-align:top;" width="100%">
              
                  <tr>
                    <td align="left" style="font-size:0px;padding:15px 15px 0px 15px;word-break:break-word;">
                      
            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 12px;">${element.name}</span></p>
          <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 12px;">${date} desde las <strong>${element.start}</strong> hasta las <strong>${element.end}</strong></span></p>
          <p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 12px;">Adicionales: ${micro}</span></p></div>

                    </td>
                  </tr>
                
                  <tr>
                    <td style="font-size:0px;padding:10px 10px;padding-top:10px;word-break:break-word;">
                      
            <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
            </p>
            
            <!--[if mso | IE]>
              <table
                align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
              >
                <tr>
                  <td style="height:0;line-height:0;">
                    &nbsp;
                  </td>
                </tr>
              </table>
            <![endif]-->


                    </td>
                  </tr>
                
            </table>

            </div>

                <!--[if mso | IE]>
                  </td>
                
              </tr>
            
                        </table>
                      <![endif]-->
                    </td>
                  </tr>
                </tbody>
              </table>
              
            </div>

            
            <!--[if mso | IE]>
                </td>
              </tr>
            </table>
            
            <table
              align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
            >
              <tr>
                <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
            <![endif]-->

            
            <div style="background:#E9E9E9;background-color:#E9E9E9;margin:0px auto;max-width:600px;">
              
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#E9E9E9;background-color:#E9E9E9;width:100%;">
                <tbody>
                  <tr>
                    <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                      <!--[if mso | IE]>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      
              <tr>
            
                  <td
                    class="" style="vertical-align:top;width:300px;"
                  >
                <![endif]-->
                  
            <div class="mj-column-per-50 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:50%;">
              
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#E9E9E9;vertical-align:top;" width="100%">
              
                  <tr>
                    <td align="left" style="font-size:0px;padding:0px 15px 15px 15px;word-break:break-word;">
                      
            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial;"><strong>Empleado:</strong> ${element.employe}</p>
          <p style="font-family: Ubuntu, Helvetica, Arial;"><strong>Direcci&oacute;n: </strong>${getConfigurations.businessLocation}</p></div>

                    </td>
                  </tr>
                
            </table>

            </div>

                <!--[if mso | IE]>
                  </td>
                
                  <td
                    class="" style="vertical-align:top;width:150px;"
                  >
                <![endif]-->
                  
            <div class="mj-column-per-25 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:25%;">
            <center>
              <table border="0" cellpadding="0" style="vertical-align:top;width: 100px;text-align: center;" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      ${ifConfirm}
                    </tr>
                  
              </table>
            </center>  
            

            </div>
                
                <!--[if mso | IE]>
                  </td>
                
                  <td
                    class="" style="vertical-align:top;width:150px;"
                  >
                <![endif]-->

                
                  
            <div class="mj-column-per-25 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:25%;">
              
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
              
                  <tr>
                    <td align="center" vertical-align="middle" style="font-size:0px;padding:0px 20px 20px 20px;word-break:break-word;">
                      
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                      <tr>
                          <td align="center" bgcolor="#e85034" role="presentation" style="border:none;border-radius:5px;cursor:auto;mso-padding-alt:9px 26px 9px 26px;background:#e85034;" valign="middle">
                          <a href="${getConfigurations.bussinessRoute}/cancelarcita?id=${IDS[key]._id}" style="display: inline-block; background: #e85034; color: #ffffff; font-family: Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: normal; line-height: 15px; margin: 0; text-decoration: none; text-transform: none; padding: 9px 26px 9px 26px; mso-padding-alt: 0px; border-radius: 5px;" target="_blank">
                              <span style="font-size: 12px;">Cancelar</span>
                          </a>
                          </td>
                      </tr>
                    </table>
            

                    </td>
                  </tr>
                
            </table>

            </div>

                <!--[if mso | IE]>
                  </td>
                
              </tr>
            
                        </table>
                      <![endif]-->
                    </td>
                  </tr>
                </tbody>
              </table>
              
            </div>
          `
      }
      const mail = {
        from: getConfigurations.businessName + ' no-reply@syswa.net',
        to: req.body.email,
        bcc: getConfigurations.businessEmail,
        subject: 'Detalles de tu agendamiento en ' + getConfigurations.businessName,
        html: `<!doctype html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
              <head>
                <title>
                  
                </title>
                <!--[if !mso]><!-- -->
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <!--<![endif]-->
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style type="text/css">
                  #outlook a { padding:0; }
                  body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
                  table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
                  img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
                  p { display:block;margin:13px 0; }
                </style>
                <!--[if mso]>
                <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                <!--[if lte mso 11]>
                <style type="text/css">
                  .outlook-group-fix { width:100% !important; }
                </style>
                <![endif]-->
                
              <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
                <style type="text/css">
                  @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
        @import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
                </style>
              <!--<![endif]-->
        
            
                
            <style type="text/css">
              @media only screen and (max-width:480px) {
                .mj-column-per-100 { width:100% !important; max-width: 100%; }
        .mj-column-per-33 { width:33.333333333333336% !important; max-width: 33.333333333333336%; }
        .mj-column-per-50 { width:50% !important; max-width: 50%; }
        .mj-column-per-25 { width:25% !important; max-width: 25%; }
              }
            </style>
            
          
                <style type="text/css">
                
                
        
            @media only screen and (max-width:480px) {
              table.full-width-mobile { width: 100% !important; }
              td.full-width-mobile { width: auto !important; }
            }
          
                </style>
                <style type="text/css">.hide_on_mobile { display: none !important;} 
                @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
                .hide_section_on_mobile { display: none !important;} 
                @media only screen and (min-width: 480px) { 
                    .hide_section_on_mobile { 
                        display: table !important;
                    } 
        
                    div.hide_section_on_mobile { 
                        display: block !important;
                    }
                }
                .hide_on_desktop { display: block !important;} 
                @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
                .hide_section_on_desktop { display: table !important;} 
                @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
                
                  p, h1, h2, h3 {
                      margin: 0px;
                  }
        
                  a {
                      text-decoration: none;
                      color: inherit;
                  }
        
                  @media only screen and (max-width:480px) {
        
                    .mj-column-per-100 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-100 > .mj-column-per-75 { width:75%!important; max-width:75%!important; }
                    .mj-column-per-100 > .mj-column-per-60 { width:60%!important; max-width:60%!important; }
                    .mj-column-per-100 > .mj-column-per-50 { width:50%!important; max-width:50%!important; }
                    .mj-column-per-100 > .mj-column-per-40 { width:40%!important; max-width:40%!important; }
                    .mj-column-per-100 > .mj-column-per-33 { width:33.333333%!important; max-width:33.333333%!important; }
                    .mj-column-per-100 > .mj-column-per-25 { width:25%!important; max-width:25%!important; }
        
                    .mj-column-per-100 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-75 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-60 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-50 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-40 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-33 { width:100%!important; max-width:100%!important; }
                    .mj-column-per-25 { width:100%!important; max-width:100%!important; }
                }</style>
                
              </head>
              <body style="background-color:#FFFFFF;">
                
                
              <div style="background-color:#FFFFFF;">
                
              
              <!--[if mso | IE]>
              <table
                 align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                       class="" style="vertical-align:top;width:600px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                        
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                <tbody>
                  <tr>
                    <td style="width:186px;">
                      
              <img height="auto" src="${getConfigurations.bussinessLogo}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="186">
            
                    </td>
                  </tr>
                </tbody>
              </table>
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 0px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><h2 style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">${getConfigurations.businessName}</h2>
        <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">&nbsp;</p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                 align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                       class="" style="vertical-align:top;width:600px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">${client}, tu reserva fue recibida exitosamente</p></div>
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td style="font-size:0px;padding:10px 0px;padding-top:10px;word-break:break-word;">
                        
              <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
              </p>
              
              <!--[if mso | IE]>
                <table
                   align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:600px;" role="presentation" width="600px"
                >
                  <tr>
                    <td style="height:0;line-height:0;">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              <![endif]-->
            
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                 align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                       class="" style="vertical-align:top;width:200px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 0px 15px 0px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 18px;">Detalles de agendamiento</span></p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                       class="" style="vertical-align:top;width:200px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td style="font-size:0px;padding:37px 0px;padding-top:37px;word-break:break-word;">
                        
              <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
              </p>
              
              <!--[if mso | IE]>
                <table
                   align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:200px;" role="presentation" width="200px"
                >
                  <tr>
                    <td style="height:0;line-height:0;">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              <![endif]-->
            
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                    <td
                       class="" style="vertical-align:top;width:200px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 10px 10px 10px;word-break:break-word;">
                        
              
             <!--[if mso | IE]>
              <table
                 align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
              >
                <tr>
              
                      <td>
                    <![endif]-->
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                        
              <tr>
                <td style="padding:4px;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border-radius:3px;width:50px;">
                    <tr>
                      <td style="font-size:0;height:50px;vertical-align:middle;width:50px;">
                        <a href="https://api.whatsapp.com/send?phone=${getConfigurations.businessPhone.countryCallingCode + getConfigurations.businessPhone.nationalNumber}&text=&source=&data=&app_absent=" target="_blank" style="color: #0000EE;">
                            <img height="50" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/6114035a78f23/1628711480.jpg" style="border-radius:3px;display:block;" width="50">
                          </a>
                        </td>
                      </tr>
                  </table>
                </td>
                
              </tr>
            
                      </table>
                    <!--[if mso | IE]>
                      </td>
                    
                      <td>
                    <![endif]-->
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
                        
              <tr>
                <td style="padding:4px;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border-radius:3px;width:50px;">
                    <tr>
                      <td style="font-size:0;height:50px;vertical-align:middle;width:50px;">
                        <a href="mailto:${getConfigurations.businessEmail}" target="_blank" style="color: #0000EE;">
                            <img height="50" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/6114035a78f23/1628712889.jpg" style="border-radius:3px;display:block;" width="50">
                          </a>
                        </td>
                      </tr>
                  </table>
                </td>
                
              </tr>
            
                      </table>
                    <!--[if mso | IE]>
                      </td>
                    
                  </tr>
                </table>
              <![endif]-->
            
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                 align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              <!-- DESDE AQUI -->
        
              ${services}
              
            
              <!-- HASTA AQUI -->

            <!--POLITICAAAAAAAAAAAAS #####################################-->

            <div style="margin:0px auto;max-width:600px; margin-top: 70px;">
              
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                  <tr>
                    <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                      <!--[if mso | IE]>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      
              <tr>
            
                  <td
                    class="" style="vertical-align:top;width:300px;"
                  >
                <![endif]-->
                  
            <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
              
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
              
                  <tr>
                    <td align="left" style="font-size:0px;padding:0px 15px 0px 15px;word-break:break-word;">
                      
            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#282727;">
              
              ${getConfigurations.datesPolicies}
            
            </div>

                    </td>
                  </tr>
                
            </table>

            </div>

                <!--[if mso | IE]>
                  </td>
                
                  <td
                    class="" style="vertical-align:top;width:150px;"
                  >
                <![endif]-->
                
                <!--[if mso | IE]>
                  </td>
                
                  <td
                    class="" style="vertical-align:top;width:150px;"
                  >
                <![endif]-->

                
                  
            

                <!--[if mso | IE]>
                  </td>
                
              </tr>
            
                        </table>
                      <![endif]-->
                    </td>
                  </tr>
                </tbody>
              </table>
              
            </div>

            <!--POLITICAAAAAS #################################-->
        
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              
              <table
                 align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
              >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
              <![endif]-->
            
              
              <div style="margin:0px auto;max-width:600px;">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                        <!--[if mso | IE]>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        
                <tr>
              
                    <td
                       class="" style="vertical-align:top;width:600px;"
                    >
                  <![endif]-->
                    
              <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                      <td style="font-size:0px;padding:47px 10px;padding-top:0px;word-break:break-word;">
                        
              <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
              </p>
              
              <!--[if mso | IE]>
                <table
                   align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
                >
                  <tr>
                    <td style="height:0;line-height:0;">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              <![endif]-->
            
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td align="center" style="font-size:0px;padding:15px 0px 15px 0px;word-break:break-word;">
                        
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                <tbody>
                  <tr>
                    <td style="width:204px;">
                      
                <a href="Links pagina de syswa" target="_blank" style="color: #0000EE;">
                  
              <img height="auto" src="https://s3-eu-west-1.amazonaws.com/topolio/uploads/6114035a78f23/1628706676.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="204">
            
                </a>
              
                    </td>
                  </tr>
                </tbody>
              </table>
            
                      </td>
                    </tr>
                  
                    <tr>
                      <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                        
              <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">Copyright 2022 | ${branch} | Todos los derechos reservados</p></div>
            
                      </td>
                    </tr>
                  
              </table>
            
              </div>
            
                  <!--[if mso | IE]>
                    </td>
                  
                </tr>
              
                          </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </div>
            
              
              <!--[if mso | IE]>
                  </td>
                </tr>
              </table>
              <![endif]-->
            
            
              </div>
            
              </body>
            </html> `
      }
      Mails.sendMail(mail)
        .then(send => {
          console.log(send)
        }).catch(err => {
          console.log(err)
        })
      res.json({ status: 'ok' })
    }
  } catch (err) {
    console.log(err)
    res.send(err)
  }

})

mails.post('/responseDate', async (req, res) => {
  var confirmed = req.body.confirmed
  var subject = ''
  var subject2 = ''
  var textAlt = ''
  var textConfirm = ''
  var textConfirmClient = ''
  var dateFormat = req.body.date
  var splitDate = dateFormat.split("-")
  dateFormat = splitDate[1] + '-' + splitDate[0] + '-' + splitDate[2]
  if (confirmed) {
    subject = req.body.client + ' Confirmo su cita para el: ' + dateFormat
    subject2 = req.body.client + ' Has confirmado tu cita para el: ' + dateFormat
    textAlt = '<em><strong><span style="color: #2dc26b;">confirmado</span></strong></em>'
  } else {
    textAlt = '<em><strong><span style="color: #e03e2d;">cancelado</span></strong></em>'
    if (req.body.system) {
      subject = 'Has cancelado la cita de ' + req.body.client + ' para el: ' + dateFormat
      subject2 = req.body.client + ' se ha cancelado tu cita para el: ' + dateFormat
      textConfirm = `<p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 14px;"><span style="font-size: 16px;">
       ${req.body.user} ha ${textAlt} la cita de <strong>${req.body.client}</strong> para el:</span>&nbsp; <span style="text-decoration: underline;"><strong>${dateFormat}</strong></span></span></p>`
      textConfirmClient = `<p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 14px;"><span style="font-size: 16px;">
      <strong>${req.body.client}</strong> le informamos que su cita agendada para el <span style="text-decoration: underline;"><strong>${dateFormat}</strong></span> ha sido <em><strong><span style="color: #e03e2d;">cancelada</span></strong></em></span>&nbsp; </span> <br><br> Nota: En caso de no haber solicitado dicha acción contáctanos para regularizar situación.</p>`
    } else {
      subject = req.body.client + ' Cancelo su cita para el: ' + dateFormat
      subject2 = req.body.client + ' Has cancelado tu cita para el: ' + dateFormat
      textConfirm = `<p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 14px;"><span style="font-size: 16px;">
      <strong>${req.body.client}</strong> ha ${textAlt} su cita para el:</span>&nbsp; <span style="text-decoration: underline;"><strong>${dateFormat}</strong></span></span></p>`
      textConfirmClient = `<p style="font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 14px;"><span style="font-size: 16px;">
      <strong>${req.body.client}</strong> has ${textAlt} tu cita para el:</span>&nbsp; <span style="text-decoration: underline;"><strong>${dateFormat}</strong></span></span></p>`
    }
  }
  const mail = {
    from: req.body.branchName + ' no-reply@syswa.net',
    to: req.body.email,
    subject: subject,
    html: `<!doctype html>
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <title>
            
          </title>
          <!--[if !mso]><!-- -->
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <!--<![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style type="text/css">
            #outlook a { padding:0; }
            body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
            table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
            img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
            p { display:block;margin:13px 0; }
          </style>
          <!--[if mso]>
          <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
          <!--[if lte mso 11]>
          <style type="text/css">
            .outlook-group-fix { width:100% !important; }
          </style>
          <![endif]-->
          
        <!--[if !mso]><!-->
          <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
          <style type="text/css">
            @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
  @import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
          </style>
        <!--<![endif]-->
  
      
          
      <style type="text/css">
        @media only screen and (max-width:480px) {
          .mj-column-per-100 { width:100% !important; max-width: 100%; }
  .mj-column-per-33 { width:33.333333333333336% !important; max-width: 33.333333333333336%; }
        }
      </style>
      
    
          <style type="text/css">
          
          
  
      @media only screen and (max-width:480px) {
        table.full-width-mobile { width: 100% !important; }
        td.full-width-mobile { width: auto !important; }
      }
    
          </style>
          <style type="text/css">.hide_on_mobile { display: none !important;} 
          @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
          .hide_section_on_mobile { display: none !important;} 
          @media only screen and (min-width: 480px) { 
              .hide_section_on_mobile { 
                  display: table !important;
              } 
  
              div.hide_section_on_mobile { 
                  display: block !important;
              }
          }
          .hide_on_desktop { display: block !important;} 
          @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
          .hide_section_on_desktop { 
              display: table !important;
              width: 100%;
          } 
          @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
          
            p, h1, h2, h3 {
                margin: 0px;
            }
  
            a {
                text-decoration: none;
                color: inherit;
            }
  
            @media only screen and (max-width:480px) {
  
              .mj-column-per-100 { width:100%!important; max-width:100%!important; }
              .mj-column-per-100 > .mj-column-per-75 { width:75%!important; max-width:75%!important; }
              .mj-column-per-100 > .mj-column-per-60 { width:60%!important; max-width:60%!important; }
              .mj-column-per-100 > .mj-column-per-50 { width:50%!important; max-width:50%!important; }
              .mj-column-per-100 > .mj-column-per-40 { width:40%!important; max-width:40%!important; }
              .mj-column-per-100 > .mj-column-per-33 { width:33.333333%!important; max-width:33.333333%!important; }
              .mj-column-per-100 > .mj-column-per-25 { width:25%!important; max-width:25%!important; }
  
              .mj-column-per-100 { width:100%!important; max-width:100%!important; }
              .mj-column-per-75 { width:100%!important; max-width:100%!important; }
              .mj-column-per-60 { width:100%!important; max-width:100%!important; }
              .mj-column-per-50 { width:100%!important; max-width:100%!important; }
              .mj-column-per-40 { width:100%!important; max-width:100%!important; }
              .mj-column-per-33 { width:100%!important; max-width:100%!important; }
              .mj-column-per-25 { width:100%!important; max-width:100%!important; }
          }</style>
          
        </head>
        <body style="background-color:#FFFFFF;">
          
          
        <div style="background-color:#FFFFFF;">
          
        
        <!--[if mso | IE]>
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
        >
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      
        
        <div style="margin:0px auto;max-width:600px;">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                  <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  
          <tr>
        
              <td
                 class="" style="vertical-align:top;width:600px;"
              >
            <![endif]-->
              
        <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
          
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          
              <tr>
                <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                  
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
          <tbody>
            <tr>
              <td style="width:180px;">
                
        <img height="auto" src="${req.body.logo}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="180">
      
              </td>
            </tr>
          </tbody>
        </table>
      
                </td>
              </tr>
            
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;">
        <center>
        ${textConfirm}
        </center>
        
        </div>
      
                </td>
              </tr>
            
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><h1 style="font-family: 'Cabin', sans-serif; text-align: center;"><strong>Detalles</strong></h1></div>
      
                </td>
              </tr>
            
              <tr>
                <td style="font-size:0px;padding:10px 10px;padding-top:10px;padding-right:10px;word-break:break-word;">
                  
        <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
        </p>
        
        <!--[if mso | IE]>
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
          >
            <tr>
              <td style="height:0;line-height:0;">
                &nbsp;
              </td>
            </tr>
          </table>
        <![endif]-->
      
      
                </td>
              </tr>
            
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><h2 style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">${req.body.service}</h2></div>
      
                </td>
              </tr>
            
        </table>
      
        </div>
      
            <!--[if mso | IE]>
              </td>
            
          </tr>
        
                    </table>
                  <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
        >
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      
        
        <div style="margin:0px auto;max-width:600px;">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                  <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  
          <tr>
        
              <td
                 class="" style="vertical-align:top;width:200px;"
              >
            <![endif]-->
              
        <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
          
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Empleado</span></strong></p>
  <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;">${req.body.employe}</span></p></div>
      
                </td>
              </tr>
            
        </table>
      
        </div>
      
            <!--[if mso | IE]>
              </td>
            
              <td
                 class="" style="vertical-align:top;width:200px;"
              >
            <![endif]-->
              
        <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
          
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Servicios adicionales</span></strong></p>
  <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 16px;">${req.body.micro}</span></p></div>
      
                </td>
              </tr>
            
        </table>
      
        </div>
      
            <!--[if mso | IE]>
              </td>
            
              <td
                 class="" style="vertical-align:top;width:200px;"
              >
            <![endif]-->
              
        <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
          
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Horario</span></strong></p>
  <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;">${req.body.start} / ${req.body.end}</span></p></div>
      
                </td>
              </tr>
            
        </table>
      
        </div>
      
            <!--[if mso | IE]>
              </td>
            
          </tr>
        
                    </table>
                  <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
        >
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      
        
        <div style="margin:0px auto;max-width:600px;">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                  <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  
          <tr>
        
              <td
                 class="" style="vertical-align:top;width:600px;"
              >
            <![endif]-->
              
        <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
          
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          
              <tr>
                <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                  
        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Sucursal</span></strong></p>
  <p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;">${req.body.branchName}</span></p></div>
      
                </td>
              </tr>
            
        </table>
      
        </div>
      
            <!--[if mso | IE]>
              </td>
            
          </tr>
        
                    </table>
                  <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        <![endif]-->
      
      
        </div>
      
        </body>
      </html>`
  }
  const mail2 = {
    from: req.body.branchName + ' no-reply@syswa.net',
    to: req.body.clientMail,
    subject: subject2,
    html: `<!doctype html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <title>
          
        </title>
        <!--[if !mso]><!-- -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
          #outlook a { padding:0; }
          body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
          table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
          img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
          p { display:block;margin:13px 0; }
        </style>
        <!--[if mso]>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <!--[if lte mso 11]>
        <style type="text/css">
          .outlook-group-fix { width:100% !important; }
        </style>
        <![endif]-->
        
      <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
<link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
        <style type="text/css">
          @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
@import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
        </style>
      <!--<![endif]-->

    
        
    <style type="text/css">
      @media only screen and (max-width:480px) {
        .mj-column-per-100 { width:100% !important; max-width: 100%; }
.mj-column-per-33 { width:33.333333333333336% !important; max-width: 33.333333333333336%; }
      }
    </style>
    
  
        <style type="text/css">
        
        

    @media only screen and (max-width:480px) {
      table.full-width-mobile { width: 100% !important; }
      td.full-width-mobile { width: auto !important; }
    }
  
        </style>
        <style type="text/css">.hide_on_mobile { display: none !important;} 
        @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
        .hide_section_on_mobile { display: none !important;} 
        @media only screen and (min-width: 480px) { 
            .hide_section_on_mobile { 
                display: table !important;
            } 

            div.hide_section_on_mobile { 
                display: block !important;
            }
        }
        .hide_on_desktop { display: block !important;} 
        @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
        .hide_section_on_desktop { 
            display: table !important;
            width: 100%;
        } 
        @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
        
          p, h1, h2, h3 {
              margin: 0px;
          }

          a {
              text-decoration: none;
              color: inherit;
          }

          @media only screen and (max-width:480px) {

            .mj-column-per-100 { width:100%!important; max-width:100%!important; }
            .mj-column-per-100 > .mj-column-per-75 { width:75%!important; max-width:75%!important; }
            .mj-column-per-100 > .mj-column-per-60 { width:60%!important; max-width:60%!important; }
            .mj-column-per-100 > .mj-column-per-50 { width:50%!important; max-width:50%!important; }
            .mj-column-per-100 > .mj-column-per-40 { width:40%!important; max-width:40%!important; }
            .mj-column-per-100 > .mj-column-per-33 { width:33.333333%!important; max-width:33.333333%!important; }
            .mj-column-per-100 > .mj-column-per-25 { width:25%!important; max-width:25%!important; }

            .mj-column-per-100 { width:100%!important; max-width:100%!important; }
            .mj-column-per-75 { width:100%!important; max-width:100%!important; }
            .mj-column-per-60 { width:100%!important; max-width:100%!important; }
            .mj-column-per-50 { width:100%!important; max-width:100%!important; }
            .mj-column-per-40 { width:100%!important; max-width:100%!important; }
            .mj-column-per-33 { width:100%!important; max-width:100%!important; }
            .mj-column-per-25 { width:100%!important; max-width:100%!important; }
        }</style>
        
      </head>
      <body style="background-color:#FFFFFF;">
        
        
      <div style="background-color:#FFFFFF;">
        
      
      <!--[if mso | IE]>
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->
    
      
      <div style="margin:0px auto;max-width:600px;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                
        <tr>
      
            <td
               class="" style="vertical-align:top;width:600px;"
            >
          <![endif]-->
            
      <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
        
            <tr>
              <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
        <tbody>
          <tr>
            <td style="width:180px;">
              
      <img height="auto" src="${req.body.logo}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="180">
    
            </td>
          </tr>
        </tbody>
      </table>
    
              </td>
            </tr>
          
            <tr>
              <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;">
      <center>
      ${textConfirmClient}
      </center>
      
      </div>
    
              </td>
            </tr>
          
            <tr>
              <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><h1 style="font-family: 'Cabin', sans-serif; text-align: center;"><strong>Detalles</strong></h1></div>
    
              </td>
            </tr>
          
            <tr>
              <td style="font-size:0px;padding:10px 10px;padding-top:10px;padding-right:10px;word-break:break-word;">
                
      <p style="font-family: Ubuntu, Helvetica, Arial; border-top: solid 1px #000000; font-size: 1; margin: 0px auto; width: 100%;">
      </p>
      
      <!--[if mso | IE]>
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #000000;font-size:1;margin:0px auto;width:580px;" role="presentation" width="580px"
        >
          <tr>
            <td style="height:0;line-height:0;">
              &nbsp;
            </td>
          </tr>
        </table>
      <![endif]-->
    
    
              </td>
            </tr>
          
            <tr>
              <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><h2 style="font-family: Ubuntu, Helvetica, Arial; text-align: center;">${req.body.service}</h2></div>
    
              </td>
            </tr>
          
      </table>
    
      </div>
    
          <!--[if mso | IE]>
            </td>
          
        </tr>
      
                  </table>
                <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    
      
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->
    
      
      <div style="margin:0px auto;max-width:600px;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                
        <tr>
      
            <td
               class="" style="vertical-align:top;width:200px;"
            >
          <![endif]-->
            
      <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
        
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
        
            <tr>
              <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Empleado</span></strong></p>
<p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;">${req.body.employe}</span></p></div>
    
              </td>
            </tr>
          
      </table>
    
      </div>
    
          <!--[if mso | IE]>
            </td>
          
            <td
               class="" style="vertical-align:top;width:200px;"
            >
          <![endif]-->
            
      <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
        
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
        
            <tr>
              <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Servicios adicionales</span></strong></p>
<p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 16px;">${req.body.micro}</span></p></div>
    
              </td>
            </tr>
          
      </table>
    
      </div>
    
          <!--[if mso | IE]>
            </td>
          
            <td
               class="" style="vertical-align:top;width:200px;"
            >
          <![endif]-->
            
      <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333333333336%;">
        
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
        
            <tr>
              <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Horario</span></strong></p>
<p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;">${req.body.start} / ${req.body.end}</span></p></div>
    
              </td>
            </tr>
          
      </table>
    
      </div>
    
          <!--[if mso | IE]>
            </td>
          
        </tr>
      
                  </table>
                <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    
      
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->
    
      
      <div style="margin:0px auto;max-width:600px;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                
        <tr>
      
            <td
               class="" style="vertical-align:top;width:600px;"
            >
          <![endif]-->
            
      <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
        
            <tr>
              <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><strong><span style="font-size: 16px;">Sucursal</span></strong></p>
<p style="font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="font-size: 14px;">${req.body.branchName}</span></p></div>
    
              </td>
            </tr>
          
      </table>
    
      </div>
    
          <!--[if mso | IE]>
            </td>
          
        </tr>
      
                  </table>
                <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    
      
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      <![endif]-->
    
    
      </div>
    
      </body>
    </html>`
  }
  Mails.sendMail(mail2)
  try {
    const sent = await Mails.sendMail(mail)
    res.json({ status: sent })
  } catch (err) {
    console.log(err)
  }


})


module.exports = mails