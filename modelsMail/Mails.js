const nodemailer = require("nodemailer");
class Email{

    constructor(KConfig){
        this.createTransport = nodemailer.createTransport(KConfig)   
    }

    sendMail(KEmail){
        try{
            this.createTransport.sendMail(KEmail, (error, info) => {
                if(error){
                    const givePromise = new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(error)
                        }, 200);
                    })
                    this.createTransport.close()
                    return givePromise
                }else{
                    const givePromise = new Promise((resolve) => {
                        setTimeout(() => {
                            resolve('Correo enviado correctamente')
                        }, 200);
                    })
                    this.createTransport.close()
                    return givePromise
                }
                
            })
        }catch(err){
            console.log('error: '+ err)
        }
    }
}

module.exports = Email