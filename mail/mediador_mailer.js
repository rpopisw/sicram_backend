const User = require('../models/user')
const Doctor = require('../models/doctor')
const Organizacion = require('../models/organizacion')

//constructor
const Mediador_mailer = function(){}


Mediador_mailer.prototype.toString = function(){
    return `clientes ${this}`;
}
//atributos
/*
mediador_mailer.doctores = [] 
mediador_mailer.pacientes= []
mediador_mailer.organizaciones= []
*/

//metodos

Mediador_mailer.agregarDoctores = (doctor)=>{
}

Mediador_mailer.agregarPacientes = (paciente)=>{
}

Mediador_mailer.agregarOrganizaciones = (organizacion)=>{
}

//enviar mensaje a travez del mediador

Mediador_mailer.notificarRegistro = (msg,usuario)=>{
    const asunto = 'SICRAM: NOTIFICACION DE REGISTRO DE CUENTA'
    if(usuario instanceof User){
        console.log("enviando notificacion a correo PACIENTE : "+msg)
        usuario.recibirMensaje(msg,asunto)
    }
    if(usuario instanceof Doctor){
        console.log("enviando notificacion a correo DOCTOR: "+msg)
        usuario.recibirMensaje(msg,asunto)
    }
    if(usuario instanceof Organizacion){
        console.log("enviando notificacion a correo ORGANIZACION: "+msg)
        usuario.recibirMensaje(msg,asunto)
    }
}
Mediador_mailer.notificarNuevaCita = (msg,usuario)=>{
    const asunto = 'SICRAM: NUEVA CITA AGREGADA'
    if(usuario instanceof Doctor){
        console.log("enviando notificacion a correo DOCTOR: "+msg)
        usuario.recibirMensaje(msg,asunto)
    }
}
Mediador_mailer.notificarActualizacionDeCita = (doctorActual,doctorNuevo,paciente)=>{
    const asunto_update = 'SICRAM: ACTUALIZACION DE CITA'
    const asunto_eliminado = 'SICRAM: ACTUALIZACION DE CITA'
    const asunto_nuevo = 'SICRAM: ELIMINACION DE CITA'
    
    if(doctorActual instanceof Doctor){
        console.log("enviando notificacion a correo DOCTOR: ")
        if (doctorActual._id==doctorNuevo._id) {
            doctorActual.recibirMensaje(`Su paciente ${paciente.name},${paciente.lastname} \n actualizo su cita`,asunto_update)
        }else{
            doctorActual.recibirMensaje(`Su paciente ${paciente.name},${paciente.lastname} \n elimino su cita`,asunto_eliminado)
            doctorNuevo.recibirMensaje(`El paciente ${paciente.name},${paciente.lastname} \n creo una nueva cita`,asunto_nuevo)
        }
    }
}
    
Mediador_mailer.notificarEliminacionDeCita = (msg,usuario)=>{
    const asunto = 'SICRAM: ELIMINACION DE CITA'
    if(usuario instanceof Doctor){
        console.log("enviando notificacion a correo DOCTOR: "+msg)
        usuario.recibirMensaje(msg,asunto)
    }
}

module.exports = Mediador_mailer;