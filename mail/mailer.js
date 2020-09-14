const nodemailer = require('nodemailer')

//Harvey Raynor entrar a https://ethereal.email/   para las pruebas de los mensajes
const mailconfig = {
    service: 'gmail',
    auth: {
        user: 'iammiguel60@gmail.com',
        pass: 'dmkulugvkvevhgbm'
    }
}

module.exports = nodemailer.createTransport(mailconfig)