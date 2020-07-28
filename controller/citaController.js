var User = require("../models/user");
var Cita = require("../models/cita");
var Doctor = require("../models/doctor");
var Especialidad = require('../models/especialidad');
var Horario = require('../models/horario');

//generar nueva citas
exports.GenerarNuevaCita = async function (req,res) {
    try{
        var token = getToken(req.headers);
        if (token) {
            if(req.user.id==req.params.id){
            console.log(req.body);
            //creando nueva cita
            var nuevacita = new Cita();
            //encontrando al usuario por parametro
            var paciente = await User.findById(req.user._id);   //deberia ser metido por parametro
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
                        //agregamos la cita para el doctor
                        doctor.cita.push(nuevacita);
                        //guardamos al user con su cita
                        await paciente.save();
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
        }else{     
            res.send('NO ES EL USUARIO   ' +   req.user.id + ' comparando con ' + req.params.id)
        }
        
      } else {
       return res.status(403).send({success: false, msg: 'Unauthorized.'});
        }
    }catch(err){
        console.error('ERRRRORRRRRRR--------------------------------' + err)
        res.status(400).json({msg: 'Codigo Doctor no encontrado'});
   }
}
exports.Obtener_Citas_Paciente = async function(req,res){
    try{
        var token = getToken(req.headers);
        if (token) {
           if(req.user.id==req.params.id){
                console.log('obtener Cita :  '+req.user.id);    
                await Cita.find({user:req.user.id},(err,citas)=>{
                    if(err){
                        res.json({msg:'no encontro las cita'})
                    }else{
                        res.status(200).json(citas);
                    }
                }).populate('horario');//.populate('especialidad');


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
exports.Actualizar_Citas = async function(req,res){
    try{
        var token = getToken(req.headers);
        if (token) {
           if(req.user.id==req.params.id){
            //encontramos la cita por su codigo
            await Cita.findOne({_id:req.body.id},async  (error,cita)=>{
                if (error) {
                    res.json({msg: 'cita no encontrada'});
                } else {
                    
                    //AGREGAR ACTUALIZACION DE CITA ENCONTRAD
                    res.json({msg: 'aun modificando'});      





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

  //metodo para confirmar que entro un token 
  getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        console.log(parted);
        return parted[1];
        
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
