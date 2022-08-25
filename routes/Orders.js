const express = require('express')
const orders = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const ordersSchema = require('../models/Orders')
const configurationSchema = require('../models/Configurations')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
const formats = require('../formats')
const pdf = require("pdf-creator-node");
const fs = require('fs');
//Ejemplo logs logDates.info(``);
const cors = require('cors')
const connect = require('../mongoConnection/conectionInstances')

orders.use(cors())

orders.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)

    try{
        const findOrders = await Order.find()

        if (findOrders) {
            res.json({status: "ok", data: findOrders})
        }
    }catch(err){
        console.log(err)
    }

})

orders.get('/pending', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)

    try{
        const findOrders = await Order.find({status: "nConfirmed"})

        if (findOrders) {
            res.json({status: "ok", data: findOrders})
        }

    }catch(err){
        console.log(err)
    }

})

orders.get('/confirmed', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)

    try{
        const findOrders = await Order.find({status: "confirmed"})

        if (findOrders) {
            
            res.json({status: "ok", data: findOrders})
        }

    }catch(err){
        console.log(err)
    }

})

orders.get('/used', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)

    try{
        const findOrders = await Order.find({
            $or: [
                {status: "used"}, 
                {status: "expired"},
            ]
            
        })

        if (findOrders) {
            
            res.json({status: "ok", data: findOrders})
        }

    }catch(err){
        console.log(err)
    }

})

orders.get('/validcode/:order', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)

    try{
        const findByOrder = await Order.findOne({orderNumber: req.params.order})

        if(findByOrder){
            const dataOrder = {
                products: findByOrder.products,
                client: findByOrder.client,
                payType: findByOrder.payType,
                total: findByOrder.total,
                status: findByOrder.status,
                orderNumber: findByOrder.orderNumber
            }
            res.json({status: "ok", data: dataOrder})
        }else{
            res.json({status: "nothing"})
        }
    }catch(err){
        console.log(err)
    }
})


orders.post('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)
    
    try{
        var nOrder = 0
        const findLastOrder = await Order.find().sort({orderNumber: -1}).limit(1)
        
        if(findLastOrder.length > 0 ){
            nOrder = parseFloat(findLastOrder[0].orderNumber) + 1
        }

        var expired = new Date()

        expired.setDate(expired.getDate()+req.body.branch.politics.timeLimit)
        const timeLimit = req.body.branch.politics.timeLimit
        const data = {
            products: req.body.products,
            branch: req.body.branch,
            code: new Date().getTime(),
            client: req.body.client,
            payType: req.body.payType,
            createdAt: new Date(),
            total: req.body.total,
            status: "nConfirmed",
            orderNumber: nOrder,
            expiredDate: expired
        }
        console.log(data.branch)
        data.branch.politics = req.body.branch.politics.politics
        let dollarUSLocale = Intl.NumberFormat('de-DE');
        var products = ''
        var total = 0
        data.products.forEach(element => {
            products = products + `
            <tr class="trD">
                <td class="tdD">${element.name}</td>
                <td class="tdD">$ ${dollarUSLocale.format(element.price)}</td>
            </tr>`
        });
        
        
        var date = new Date()

        if (date.getDate() < 10) {
            var one = "0" + date.getDate()
        }
        else {
            var one = date.getDate()
        }
        if (date.getMonth() < 9 ) {
            var two = "0" + (date.getMonth() + 1)
        }
        else{
            var two = (date.getMonth() + 1)
        }
        var fechaCartelua = one+"-"+two+"-"+date.getFullYear()

        try{
            const createOrder = await Order.create(data)
            let dollarUSLocale = Intl.NumberFormat('de-DE');
            if(createOrder){
                
                let mail = {}
                
                mail = {
                    from: data.branch.name + ' no-reply@syswa.net',
                    to: data.client.email,
                    subject: 'Compra de Gift Card en ' + data.branch.name + ' en proceso',
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
                        <link href="https://fonts.googleapis.com/css?family=Poppins:400,700" rel="stylesheet" type="text/css">
                                <style type="text/css">
                                @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
                        @import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
                        @import url(https://fonts.googleapis.com/css?family=Poppins:400,700);
                                </style>
                            <!--<![endif]-->
                        
                            
                                
                            <style type="text/css">
                            @media only screen and (max-width:480px) {
                                .mj-column-per-100 { width:100% !important; max-width: 100%; }
                            }
                            </style>
                            
                        
                                <style type="text/css">
                                
                                
                                .tableD {
                        font-family: arial, sans-serif;
                        border-collapse: collapse;
                        color: #000000 !important;
                        width: 100%;
                        }
                        
                        .tdD, .thD {
                        border: 1px solid #dddddd;
                        text-align: left;
                        color:black;
                        padding: 8px;
                        }
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
                        
                                ul, li, ol {
                                    font-size: 11px;
                                    font-family: Ubuntu, Helvetica, Arial;
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
                            <body style="background-color:#00315a;">
                                
                                
                            <div style="background-color:#00315a;">
                                
                            
                            <!--[if mso | IE]>
                            <table
                                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                            >
                                <tr>
                                <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                            <![endif]-->
                            
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
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
                                        
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;" class="full-width-mobile">
                                <tbody>
                                <tr>
                                    <td style="width:180px;" class="full-width-mobile">
                                    
                            <img height="auto" src="${data.branch.logo}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="180">
                            
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            
                                    </td>
                                    </tr>
                                
                                    <tr>
                                    <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                        
                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;color:#000000;"><p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: justify;"><span style="font-size: 14px; font-family: Poppins, sans-serif;">Estimado(a) <strong>${data.client.name}</strong>,&nbsp;</span></p>
                        <p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: justify;">&nbsp;</p>
                        <p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: justify;"><span style="font-size: 14px; font-family: Poppins, sans-serif;">Hemos recibido una solicitud de compra por pagar en ${data.payType}. Para realizar este pago debes presentar en caja el siguiente c&oacute;digo: <strong>${createOrder.orderNumber}</strong>.</span></p></div>
                            
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
                                        
                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;color:#000000;"><p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: justify;"><span style="font-size: 14px; font-family: Poppins, sans-serif;"><strong>Informaci&oacute;n importante:</strong> Este c&oacute;digo tiene fecha de vencimiento de <strong>${timeLimit}</strong> d&iacute;as h&aacute;biles a pagar en la siguiente direcci&oacute;n:</span></p>
                        <p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: justify;">&nbsp;</p>
                        <p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: justify;"><span style="font-size: 14px; font-family: Poppins, sans-serif;">${data.branch.location}</span></p></div>
                            
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
                                        
                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;color:#000000;"><p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial;"><strong><span style="font-size: 14px; font-family: Poppins, sans-serif;">A continuaci&oacute;n te dejamos el detalle de tu compra:</span></strong></p>
                        <p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial;">&nbsp;</p>
                        <p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial;"><span style="font-size: 14px; font-family: Poppins, sans-serif;"><strong>Nombre:</strong> ${data.client.name}</span><br><span style="font-size: 14px; font-family: Poppins, sans-serif;"><strong>Monto:</strong> $ ${dollarUSLocale.format(data.total)}</span><br><span style="font-size: 14px; font-family: Poppins, sans-serif;"><strong>C&oacute;digo de compra:</strong> ${createOrder.orderNumber}</span><br><span style="font-size: 14px; font-family: Poppins, sans-serif;"><strong>Tel&eacute;fono:</strong> ${data.client.phone}</span><br><span style="font-size: 14px; font-family: Poppins, sans-serif;"><strong>Email:</strong> ${data.client.email}</span><br><span style="font-size: 14px; font-family: Poppins, sans-serif;"><strong>Fecha de compra:</strong> ${fechaCartelua}</span></p></div>
                            
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
                            
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
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
                                center
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                
                                    <tr>
                                    <td align="center" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                        <table class="tableD" style="font-size: 14px;margin-bottom: 40px;">
                                        <tr class="trD">
                                            <th class="thD"> <span>Servicio</span> </th>
                                            <th class="thD">Precio</th>
                                        </tr>
                                        ${products}
                                        <tr>
                                            <th class="thD">Total</th>
                                            <th class="thD">$ ${dollarUSLocale.format(data.total)}</th>
                                        </tr>
                                        
                                        </table>
                            
                            
                                    </td>
                                    </tr>
                                
                            </table>
                            <span style="font-size:12px; text-align:center; color:#7e7c7cc4;">${data.branch.politics}</span>
                            
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
                .then(res => {
                    res.json({status: "ok", data:createOrder })
                })
                
                
                
            }
        }catch(err){
            res.json(err)
            console.log(err)
        }
    }catch(err){
        res.json(err)
        console.log(err)
    }
    
})

orders.put('/usecodef/:code', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)

    try{
        const valid = await Order.findOne({code: req.params.code, orderNumber: req.body.orderNumber})
        if(valid){
            res.json({status: "ok", data: valid})
            
        }else{
            res.json({status: "nothing"})
        }
    }catch(err){
        console.log(err)
    }

})

orders.put('/usecode/:code', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)

    try{
        const valid = await Order.findOne({code: req.params.code, orderNumber: req.body.orderNumber})
        if(valid){
            
            try{
                valid.total = parseFloat(valid.total) - parseFloat(req.body.total)
                if(valid.total == 0){
                    const useCode = await Order.findByIdAndUpdate(valid._id, {
                        total: 0,
                        status: "used",
                        processDate: new Date()
                    })
            
                    if(useCode){
                        res.json({status: "ok", data: useCode})
                    }
                }else{
                    const useCodeE = await Order.findByIdAndUpdate(valid._id, {
                        total: valid.total
                    })
            
                    if(useCodeE){
                        res.json({status: "ok", data: useCodeE})
                    }
                }
                
            }catch(err){
                console.log(err)
            }
        }else{
            res.json({status: "nothing"})
        }
    }catch(err){
        console.log(err)
    }

})

orders.put('/confirmorder/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const Order = connect.useDb(database).model('orders', ordersSchema)

    try{
        const useCode = await Order.findByIdAndUpdate(req.params.id, {
            status: "confirmed"
        })

        if(useCode){

            var products = ""

            useCode.products.forEach(element => {
                products = products + ` <div class="mj-column-per-33 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:33.333333%;">
                            
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                
                    <tr>
                        <td align="left" style="font-size:0px;padding:5px 5px 5px 5px;word-break:break-word;">
                        
                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;color:#000000;border: 2px solid #002d5b;
            border-style: dashed;"><p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: center; "><span style="font-size: 14px; font-family: Poppins, sans-serif;"><span >${element.name}</span></span></p></div>
            
                        </td>
                    </tr>
                    
                </table>
            
                </div>`
            });

            var html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet">
                        <title>Document</title>
                    </head>
                    <body style="background-image: url('https://i.pinimg.com/originals/1d/00/07/1d0007a39537b5a79fa13a7161bbe273.jpg');background-repeat: no-repeat;
                    background-size: cover;margin-top: 10vh;height:300vh">
                        <div style="
                        max-width: 600px;
                        margin: 0 auto;
                    background: rgba(255, 255, 255, 0.73);
                    border-radius: 16px;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(6.1px);
                    -webkit-backdrop-filter: blur(6.1px);
                    border: 2px solid #002d5b;margin-bottom: 400px;">
                            <div style="margin:0px auto;max-width:600px;">
                            
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                                <tbody>
                                <tr>
                                    <td style="direction:ltr;font-size:0px;padding:5px 0px 5px 0px;text-align:center;">
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
                                    <td align="center" style="font-size:0px;padding:13px 20px 13px 20px;word-break:break-word;">
                                    
                            <div style="font-family:Ubuntu, sans-serif;font-size:13px;line-height:1.5;text-align:center;color:#2b729e;"><p style="font-size: 11px;"><span style="font-size: 25px; font-family: 'Lobster', cursive;"><span style="color: #002d5b;"><strong>Gift Card para ${useCode.branch.name}</strong></span></span></p></div>
                        
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
                                    class="" style="vertical-align:top;width:199.999998px;"
                                >
                                <![endif]-->
                                
                            ${products}
                        
                                <!--[if mso | IE]>
                                </td>
                                
                                <td
                                    class="" style="vertical-align:top;width:199.999998px;"
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
                                    <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                    
                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;color:#000000;"><p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="background-color: #002d5b; color: #ffffff;"><span style="font-size: 16px; font-family: Poppins, sans-serif; background-color: #002d5b; padding: 5px; border-radius: 5px;">${useCode.code}</span></span></p><br> <p style="font-size: 16px;
                            font-family: Ubuntu,Helvetica,Arial;
                            text-align: center;
                            margin-top: 10px;
                            font-weight: 600;
                            border: 1px solid #00315a;
                            border-radius: 3px;">Número de orden: ${useCode.orderNumber}</p></div>
                        
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
                        </div>
                    </body>
                    </html>
                
            `;

            var options = {
                format: "A3",
                orientation: "portrait",
                border: "10mm",
                timeout: '100000',
                header: {
                    height: "45mm",
                    contents: ''
                },
                "footer": {
                    "height": "28mm",
                    "contents": {
                        first: '',
                        2: '', // Any page number is working. 1-based index
                        default: '', // fallback value
                        last: ''
                    }
                }
            }

            arrayPdf = {
                code: req.body.code,
                articulo:req.body.article,
                client:req.body.client
            }
            var document = {
                html: html,
                data: {
                    users: arrayPdf
                },
                path: "./private/output.pdf"
            };
        
            pdf.create(document, options)
            .then(pdfRes => {
        
                let mail = {}
                
                mail = {
                    attachments: [
                        {   // stream as an attachment
                            filename: 'Gift Card.pdf',
                            content: fs.createReadStream('./private/output.pdf')
                        }
                    ],
                    from: useCode.branch.name +' no-reply@syswa.net',
                    to: useCode.client.email,
                    subject: 'Gift Card para ' + useCode.branch.name,
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
                                <link rel="preconnect" href="https://fonts.googleapis.com">
                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                            <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet">
                                <link href="https://fonts.googleapis.com/css?family=Ubuntu:400,700" rel="stylesheet" type="text/css">
                        <link href="https://fonts.googleapis.com/css?family=Poppins:400,700" rel="stylesheet" type="text/css">
                                <style type="text/css">
                                @import url(https://fonts.googleapis.com/css?family=Ubuntu:400,700);
                        @import url(https://fonts.googleapis.com/css?family=Poppins:400,700);
                                </style>
                            <!--<![endif]-->
                        
                            
                                
                            <style type="text/css">
                            @media only screen and (max-width:480px) {
                                .mj-column-per-100 { width:100% !important; max-width: 100%; }
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
                                .hide_section_on_desktop { 
                                    display: table !important;
                                    width: 100%;
                                } 
                                @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
                                
                                p, h1, h2, h3 {
                                    margin: 0px;
                                }
                        
                                ul, li, ol {
                                    font-size: 11px;
                                    font-family: Ubuntu, Helvetica, Arial;
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
                            <body style="background-color:#00315a;">
                                
                                
                            <div style="background-color:#00315a;">
                                
                            
                            <!--[if mso | IE]>
                            <table
                                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                            >
                                <tr>
                                <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                            <![endif]-->
                            
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
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
                                        
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;" class="full-width-mobile">
                                <tbody>
                                <tr>
                                    <td style="width:180px;" class="full-width-mobile">
                                    
                            <img alt="Logo_Sucursal" height="auto" src="${useCode.branch.logo}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="180">
                            
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
                            
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
                                <tbody>
                                    <tr>
                                    <td style="border:0px #000000 solid;direction:ltr;font-size:0px;padding:5px 0px 5px 0px;text-align:center;">
                                        <!--[if mso | IE]>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                        
                                <tr>
                            
                                    <td
                                    class="" style="vertical-align:middle;width:600px;"
                                    >
                                <![endif]-->
                                    
                            <div class="mj-column-per-100 outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
                                
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
                                
                                    <tr>
                                    <td align="center" style="font-size:0px;padding:15px 0px 0px 0px;word-break:break-word;">
                                        
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                <tbody>
                                <tr>
                                    <td style="width:570px;">
                                    
                            <img height="auto" src="https://storage.googleapis.com/afuxova10642/2018/Dec/Mon/1543836022.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="570">
                            
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
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
                                <tbody>
                                    <tr>
                                    <td style="direction:ltr;font-size:0px;padding:5px 0px 5px 0px;text-align:center;">
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
                                    <td align="center" style="font-size:0px;padding:13px 20px 13px 20px;word-break:break-word;">
                                        
                            <div style="font-family:Ubuntu, sans-serif;font-size:13px;line-height:1.5;text-align:center;color:#2b729e;"><p style="font-size: 11px; font-family: 'Lobster', cursive;"><span style="font-size: 30px; "><span style="color: #002d5b;"><strong>Gift Card para ${useCode.branch.name}</strong></span></span></p></div>
                            
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
                            
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
                                <tbody>
                                    <tr>
                                    <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;">
                                        <!--[if mso | IE]>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                        
                                <tr>
                            
                                    <td
                                    class="" style="vertical-align:top;width:199.999998px;"
                                    >
                                <![endif]-->
                                    
                            ${products}
                            
                            
                                <!--[if mso | IE]>
                                    </td>
                                
                                    <td
                                    class="" style="vertical-align:top;width:199.999998px;"
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
                            
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
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
                                    <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;">
                                        
                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;color:#000000;"><p style="font-size: 11px; font-family: Ubuntu, Helvetica, Arial; text-align: center;"><span style="background-color: #002d5b; color: #ffffff;"><span style="font-size: 16px; font-family: Poppins, sans-serif; background-color: #002d5b; padding: 5px; border-radius: 5px;">${useCode.code}</span></span></p> <p style="font-size: 16px;
                            font-family: Ubuntu,Helvetica,Arial;
                            text-align: center;
                            margin-top: 10px;
                            font-weight: 600;
                            border: 1px solid #00315a;
                            border-radius: 3px;"> Número de orden: ${useCode.orderNumber} </p></div>
                            
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
                            
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
                                <tbody>
                                    <tr>
                                    <td style="direction:ltr;font-size:0px;padding:11px 0px 11px 0px;text-align:center;">
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
                                    <td align="center" style="font-size:0px;padding:0px 0px 16px 0px;word-break:break-word;">
                                        
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                <tbody>
                                <tr>
                                    <td style="width:570px;">
                                    
                            <img height="auto" src="https://storage.googleapis.com/afuxova10642/2018/Dec/Mon/1543836050.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="570">
                            
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
                            
                            
                            <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                                
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
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
                                    <td align="center" style="font-size:0px;padding:15px 0px 16px 0px;word-break:break-word;">
                                        
                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;color:#000000;"><p style="font-family: Ubuntu, Helvetica, Arial; font-size: 11px;"><em><span style="font-family: Poppins, sans-serif; font-size: 13px;">Puedes descargar un pdf de esta tarjeta de regalo en el archivo adjunto del correo.</span></em></p><span style="font-size:12px; text-align:center; color:#7e7c7cc4;">${useCode.branch.politics}</span></div>
                            
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
                    
                    res.json({status:'ok'})
                })
                .catch(err => {
                    res.send(err)
                })
            })
            res.json({status: "ok", data: useCode})
        }else{
            res.json({status: "nothing"})
        }
    }catch(err){
        console.log(err)
    }
})

module.exports = orders