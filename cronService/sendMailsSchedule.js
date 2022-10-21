const cron = require('node-cron');
const mongoose = require('mongoose')
const branchSchema = require('../models/Branch')
const dateSchema = require('../models/Dates')
const configurationSchema = require('../models/Configurations')
const formats = require('../formats')
const email = require('../modelsMail/Mails')
const mailCredentials = require('../private/mail-credentials')
const Mails = new email(mailCredentials)
const connect = require('../mongoConnection/conectionInstances')
const logger = require('../Logs/serviceExport');
const logDates = logger.getLogger("dates");

class Main {

    constructor(database){
        this.database = database
    }

    async getBranch(){
        const Branch = connect.useDb(this.database).model('branches', branchSchema)
        return await Branch.find()
    }

    async getConfigurations(){
        const Configuration = connect.useDb(this.database).model('configurations', configurationSchema)
        return await Configuration.find()
    }

    async getDates(){
        const date = connect.useDb(this.database).model('dates', dateSchema)
        
        const dayAfter = formats.dayAfter(new Date())
        try {
            const branches = await this.getBranch()
            const arrayDates = []
            for (const branch of branches) {
                const getDates =  await date.find({
                    $and: [
                        { createdAt: { $gte: dayAfter+' 00:00', $lte: dayAfter+' 24:00' } },
                        { branch: branch._id }
                    ]
                })
                for (const dates of getDates) {
                    arrayDates.push(dates)
                }
            }
            
            return arrayDates
        }catch(err){
            console.log(err)
        }
    }

    async sendMails(){
      
        const dates = await this.getDates()
        const configurations = await this.getConfigurations()
        logDates.info(`********* dates length: ${dates.length} ***********`);
        try{
          for (const datee of dates) {
              const formatDate = {
                  date: `${datee.start.split(' ')[0].split('-')[1]}-${datee.start.split(' ')[0].split('-')[0]}-${datee.start.split(' ')[0].split('-')[2]}`,
                  start: datee.start.split(' ')[1],
                  end: datee.end.split(' ')[1],
              }
              var micro = ''
              for (const key in datee.microServices) {
                  const microservice = datee.microServices[key]
                  if (datee.microServices[microservice+1]) {
                      micro = micro + microservice.name + ' - '
                  }else{
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
              if(branchFind){
                branchData.name = branchFind.businessName
                branchData.email = branchFind.businessEmail
                branchData.phone = branchFind.businessPhone
                branchData.image = branchFind.bussinessLogo
                branchData.location = branchFind.businessLocation
                branchData.route = branchFind.bussinessRoute
                branchData.datesPolicies = branchFind.datesPolicies
              }
            
            if(datee.client == undefined){
              logDates.info(`********* dates length: ${JSON.stringify(datee)} ***********`);
            }
              
            if (datee.client) {
              const mail = {
                  from: branchData.name+' no-reply@syswa.net',
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
                              <a href="https://api.whatsapp.com/send?phone=${branchData.phone.countryCallingCode+branchData.phone.nationalNumber}&text=&source=&data=&app_absent=" target="_blank" style="color: #0000EE;">
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
                              
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                      <tr>
                          <td align="center" bgcolor="#2dce89" role="presentation" style="border:none;border-radius:5px;cursor:auto;mso-padding-alt:9px 26px 9px 26px;background:#2dce89;" valign="middle">
                          <a href="${branchData.route}/confirmacioncita?id=${datee._id}" style="display: inline-block; background: #2dce89; color: #ffffff; font-family: Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: normal; line-height: 15px; margin: 0; text-decoration: none; text-transform: none; padding: 9px 26px 9px 26px; mso-padding-alt: 0px; border-radius: 5px;" target="_blank">
                              <span style="font-size: 12px;">Confirmar</span>
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
              }catch(err){
                  console.log(err)
              }
            }
          }
        }catch(err){
          logDates.info(`********* error try for ${err} ***********`);
        }
    }
}

const mailTask = cron.schedule('10 10 * * *', () => {
  console.log("run mail schedule");
  logDates.info(`********* run mail schedule ***********`);
  const databases = [
    'kkprettynails-syswa',
    'house58-syswa',
    'syswa-gestion-qa'
  ]
  for (const database of databases) {
    const data = new Main(database)
    data.sendMails()
  }
})

module.exports = mailTask