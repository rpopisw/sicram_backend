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
Mediador_mailer.notificarActualizacionDeCita = (doctorActual,doctorNuevo,paciente,horario1,horario)=>{
    const asunto_update = 'SICRAM: ACTUALIZACION DE CITA'
    const asunto_eliminado = 'SICRAM: ACTUALIZACION DE CITA'
    const asunto_nuevo = 'SICRAM: ELIMINACION DE CITA'
    
    if(doctorActual instanceof Doctor){
        console.log("enviando notificacion a correo DOCTOR: ")
        if (doctorActual.id==doctorNuevo.id) {
            doctorActual.recibirMensaje(`
            Hola Doctor ${doctorActual.lastname}, ${doctorActual.name} \n
            reciba nuestros cordiales saludos\n
            Su paciente ${paciente.name},${paciente.lastname} actualizo su cita\n\n
            Detalles de la cita antes de ser actualizada:\n
            paciente: ${paciente.lastname}, ${paciente.username}\n
            dni: ${paciente.dni}\n
            fecha: ${horario1.fecha}\n
            hora de inicio: ${horario1.hora_inicio}\n
            hora de finalizacion: ${horario1.hora_fin}\n\n
            Ahora su cita tiene esta informacion:\n
            paciente: ${paciente.lastname}, ${paciente.username}\n
            dni: ${paciente.dni}\n
            fecha: ${horario.fecha}\n
            hora de inicio: ${horario.hora_inicio}\n
            hora de finalizacion: ${horario.hora_fin}\n
            `,asunto_update)
        }else{
            doctorActual.recibirMensaje(`
            Hola Doctor ${doctorActual.lastname}, ${doctorActual.name} \n
            reciba nuestros cordiales saludos\n
            le informamos que el paciente ${paciente.lastname} ${paciente.username} elimino su cita programada con usted\n
            Detalles de la cita:
            paciente: ${paciente.lastname}, ${paciente.username}
            dni: ${paciente.dni}
            fecha: ${horario1.fecha}\n
            hora de inicio: ${horario1.hora_inicio}\n
            hora de finalizacion: ${horario1.hora_fin}\n            
            Recuerde Doctor ${doctorActual.lastname} que el horario de esta cita eliminada ahora esta disponible para que otro paciente pueda tomarla.
            \n
            Saludos Atentamente: SICRAM`,asunto_eliminado)
            doctorNuevo.recibirMensaje(`
            Hola Doctor ${doctorNuevo.lastname}, ${doctorNuevo.name} \n
            reciba nuestros cordiales saludos\n
            le informamos que TIENE UNA NUEVA CITA PROGRAMADA\n
            Detalles de su nueva cita:\n
            paciente: ${paciente.lastname}, ${paciente.username}\n
            dni: ${paciente.dni}\n
            fecha: ${horario.fecha}\n
            hora de inicio: ${horario.hora_inicio}\n
            hora de finalizacion: ${horario.hora_fin}\n                    
            Gracias Doctor ${doctorNuevo.lastname} su paciente estara atento para ingresar a la sala virtual en la fecha y hora indicada.
            \n
            Saludos Atentamente: SICRAM `,asunto_nuevo)
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