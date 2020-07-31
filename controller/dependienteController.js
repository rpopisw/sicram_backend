var User = require('../models/user');
var Dependiente= require('../models/dependiente');
var Doctor = require('../models/doctor');
var Cita = require('../models/cita');
var Horario = require('../models/horario');
var Especialidad = require('../models/especialidad');
exports.Agregar_Dependiente = async function(req,res){
    try{
        var token = getToken(req.headers);
        if (token) {
           
           if(req.user.id==req.params.id){
                console.log('USUARIO ?   '+req.user.id); 
                //encontramos al usuario  
                var user = await User.findById(req.params.id);
                //nuevo dependiente
                var newDependiente = new Dependiente({
                    name:     req.body.name,
                    lastname: req.body.lastname,    
                    email:    req.body.email,
                    dni:      req.body.dni,
                    edad:     req.body.edad,
                    discapacidad:  req.body.discapacidad,
                    celular:    req.body.celular,
                    direccion:  req.body.direccion 
                });
                //agregamos el usuario encontrado en el dependiente
                newDependiente.user=user;
                //save del nuevo dependiente
                await  newDependiente.save((erro,dependiente)=>{
                    if (erro) {
                        res.send('error al guardar al dependiente correo ya usado:');
                    } else {
                        console.log('se guardo dependiente: '+ dependiente);
                        res.status(200).json({msg: 'nuevo dependiente guardado'});
                    }
                    });
                
                //pusheamos el nuevo dependiente al paciente
                user.dependiente.push(newDependiente);
                //guardamos user actualizado
                await user.save((err,user)=>{
                    if (err) {
                        res.send('error al guardar al usuario :'+err);
                        throw err
                    }else{
                        res.status(200).json({msg: 'nuevo dependiente guardado'});
                    }
                    });

            }else{
             res.send('NO ES EL USUARIO   ' +   req.user.id + ' comparando con ' + req.params.id)
            }
        }else{
            return res.status(403).send({success: false, msg: 'Unauthorized.'});
             }
    }catch(err){
        console.log('ERROR  '+err);
    }
}

exports.Obtener_Dependientes = async function(req,res){
    try{
        var token = getToken(req.headers);
        if (token) {
           if(req.user.id==req.params.id){
                console.log('obtener dependiente :  '+req.user.id);    
                await Dependiente.find({user:req.user.id},(err,dependientes)=>{
                    if(err){
                        res.json({msg:'no encontro las dependientes'})
                    }else{
                        res.status(200).json(dependientes);
                    }
                });

            }else{
             res.send('NO ES EL USUARIO   ' +   req.user.id + ' comparando con ' + req.params.id)
            }
        }else{
            return res.status(403).send({success: false, msg: 'Unauthorized.'});
             }
    }catch(err){
        console.log('ERROR  '+err);
    }
}

exports.Agregar_Cita_Dependiente = async function(req,res){
    try{
        var token = getToken(req.headers);
        if (token) {
 
                await Dependiente.findOne({_id:req.params.id},async (err,dependiente)=>{
                    if(err){
                        res.json({msg:'no encontro las dependientes'})
                    }else{
                        console.log(req.body);
                        //creando nueva cita
                        var nuevacita = new Cita();
                        //encontrando al usuario por parametro
                        var paciente = await User.findById(req.user.id);   //deberia ser metido por parametro
                        console.log(paciente.username);
                        //econtrando al doctor por parametro
                        var doctor = await Doctor.findById(req.body._iddoctor);
                        console.log(doctor.username);
                        //encontrando especialidad
                        var especialidad = await Especialidad.findOne({especialidad: req.body.especialidad});
                        //si especialidad es true
                        if(especialidad){
                            console.log(especialidad._id + '  COMPARA  ' + doctor.especialidad)
                            //si especialidad es la del doctor
                            if(doctor.especialidad.equals(especialidad._id)){
                                var horario = await Horario.findOne({fecha:req.body.fecha,hora_inicio:req.body.hora_inicio,hora_fin:req.body.hora_fin,doctor: doctor});
                                //si horario es true
                                if(horario){
                                    
                                    if(horario.cita){
                                        console.log('');
                                        res.json({msg: 'HORARIO YA ESTA USADO ',cita:horario.cita});
                                    }else{
                                        console.log('HORARIO: ' +horario);
                                    //agregando el doctor y el usuario a la nueva cita
                                    nuevacita.user=paciente;
                                    nuevacita.doctor=doctor;
                                    nuevacita.especialidad = especialidad;
                                    nuevacita.horario = horario;
                                    //guardamos nueva cita con su doctor y su usuario respectivo
                                    await  nuevacita.save(function(err) {
                                        if (err) {
                                        return res.json({success: false, msg: 'Error al guardar la cita'});
                                        }
                                        res.json({success: true, msg: 'Exito nueva cita creada.'});
                                    });
                                    //agregamos la cita para el usuario.
                                    paciente.cita.push(nuevacita);
                                    dependiente.cita.push(nuevacita);
                                    //agregamos la cita para el doctor
                                    doctor.cita.push(nuevacita);
                                    //guardamos al user con su cita
                                    await paciente.save();
                                    await dependiente.save();
                                    //guardamos al doctor con su cita
                                    await doctor.save();
                                    //guardamos la cita en el horario
                                    horario.cita = nuevacita;
                                    //guardamos al horario con su cita
                                    await horario.save();
                                
                                // res.send(nuevacita);  me sale error de cabecera si hago res.send
                                    }
                                    
                                }else{
                                    console.log('HORARIO NO COINCIDE ');
                                    res.json({msg: 'HORARIO NO COINCIDE'});
                                }
                    
                            }else{
                            res.json({msg: 'La especialidad del doctor no coincide'});
                            }
                        }else{
                            res.status(400).json({msg: 'especialidad no encontrada'})
                        }
                    }
                });

            


            /*
           if(req.user.id==req.params.id){
                await Dependiente.findOne({_id:req.body.id_dependiente},(err,dependiente)=>{
                    if(err){
                        res.json({msg:'no encontro las dependientes'})
                    }else{
                        console.log(req.body);
                        //creando nueva cita
                        var nuevacita = new Cita();
                        //encontrando al usuario por parametro
                        var paciente = await User.findById(req.params.id);   //deberia ser metido por parametro
                        console.log(paciente.username);
                        //econtrando al doctor por parametro
                        var doctor = await Doctor.findById(req.body._iddoctor); //deberia ser metido por parametro
                        console.log(doctor.username);
                        //encontrando especialidad
                        var especialidad = await Especialidad.findOne({especialidad: req.body.especialidad});
                        //si especialidad es true
                        if(especialidad){
                            console.log(especialidad._id + '  COMPARA  ' + doctor.especialidad)
                            //si especialidad es la del doctor
                            if(doctor.especialidad.equals(especialidad._id)){
                                var horario = await Horario.findOne({fecha:req.body.fecha,hora_inicio:req.body.hora_inicio,hora_fin:req.body.hora_fin,doctor: doctor});
                                //si horario es true
                                if(horario){console.log('HORARIO: ' +horario);
                                    //agregando el doctor y el usuario a la nueva cita
                                    nuevacita.user=paciente;
                                    nuevacita.doctor=doctor;
                                    nuevacita.especialidad = especialidad;
                                    nuevacita.horario = horario;
                                    //guardamos nueva cita con su doctor y su usuario respectivo
                                    await  nuevacita.save(function(err) {
                                        if (err) {
                                        return res.json({success: false, msg: 'Error al guardar la cita'});
                                        }
                                        res.json({success: true, msg: 'Exito nueva cita creada.'});
                                    });
                                    //agregamos la cita para el usuario.
                                    paciente.cita.push(nuevacita);
                                    dependiente.cita.push(nuevacita);
                                    //agregamos la cita para el doctor
                                    doctor.cita.push(nuevacita);
                                    //guardamos al user con su cita
                                    await paciente.save();
                                    await dependiente.save();
                                    //guardamos al doctor con su cita
                                    await doctor.save();
                                    //guardamos la cita en el horario
                                    horario.cita = nuevacita;
                                    //guardamos al horario con su cita
                                    await horario.save();
                                
                                // res.send(nuevacita);  me sale error de cabecera si hago res.send
                                }else{
                                    console.log('HORARIO NO COINCIDE ');
                                    res.json({msg: 'HORARIO NO COINCIDE'});
                                }
                    
                            }else{
                            res.json({msg: 'La especialidad del doctor no coincide'});
                            }
                        }else{
                            res.status(400).json({msg: 'especialidad no encontrada'})
                        }
                    }
                });

            }else{
             res.send('NO ES EL USUARIO   ' +   req.user.id + ' comparando con ' + req.params.id)
            }*/
        }else{
            return res.status(403).send({success: false, msg: 'Unauthorized.'});
             }
    }catch(err){
        console.log('ERROR  '+err);
    }
}

exports.Obtener_citas_dependiente = async function(req,res){

    try{
        var token = getToken(req.headers);
        if (token) {

           var dependiente =  await Dependiente.findById(req.params.id).populate('cita');
           res.json(dependiente.cita);


        }else{
            return res.status(403).send({success: false, msg: 'Unauthorized.'});
             }
    }catch(err){
        console.log('ERROR  '+err);
    }

}