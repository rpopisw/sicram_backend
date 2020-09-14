const nodemailer = require('nodemailer')

//Harvey Raynor entrar a https://ethereal.email/   para las pruebas de los mensajes
const mailconfig = {
    service: 'gmail',
    auth: {
        user: 'sicram.empresa@gmail.com',
        pass: 'eqfztkxxspknplgj'
    }
}

module.exports = nodemailer.createTransport(mailconfig)