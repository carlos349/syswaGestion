const nodemailer = require("nodemailer");
class Email{

    constructor(KConfig){
        this.createTransport = nodemailer.createTransport(KConfig)   
    }

    sendMail(KEmail){
        try{
            this.createTransport.sendMail(KEmail, (error, info) => {
                if(error){
                    console.log(error)
                }else{
                    console.log("Correo enviado correctamente")
                }
                this.createTransport.close()
            })
        }catch(err){
            console.log('error: '+ err)
        }
    }
}

module.exports = Email