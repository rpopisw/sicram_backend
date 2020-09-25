const nodemailer = require('nodemailer')

//Harvey Raynor entrar a https://ethereal.email/   para las pruebas de los mensajes
const mailconfig = {
    service: 'gmail',
    auth: {
        user: 'sicram.empresa@gmail.com',
        pass: 'itqzcunkiqawgine'
    }
}

module.exports = nodemailer.createTransport(mailconfig)