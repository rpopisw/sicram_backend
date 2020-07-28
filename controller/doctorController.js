var passport = require('passport');
var config = require('../database/key');
require('../config/userpassport')(passport);
var jwt = require('jsonwebtoken');
var Doctor = require("../models/doctor");
var Especialidad =  require('../models/especialidad');
var Horario = require('../models/horario');
var pup= require('../tools/scrapers');

  //registor doctor
  exports.SignupDoctor = async function(req, res) {
    try{
      if (!req.body.username || !req.body.password  ||!req.body.email ) {
        res.json({success: false, msg: 'Por favor, ponga nombre de usuario y contraseña'});
      } else {

           //encontrando al doctor por su email.
           await Doctor.findOne({email: req.body.email},async(erro,doctor)=>{
            try{
              if(doctor){
                  console.log(doctor.email);
                  res.status(401).json({msg: 'email ya esta siendo usado'});
               }else{
                  //varaiable que contiene los datos del cmp encontrado
                  const datosCMP = await  pup.scrapeProduct('https://200.48.13.39/cmp/php/detallexmedico.php?id='+req.body.cmp);
                  var especialidad = await Especialidad.findOne({especialidad: req.body.especialidad});

                  
                    console.log('encontro datos CMP');
                    console.log('ESTO ES LO QUE COGIO MI CAUSA'+datosCMP.nombres)

                    console.log(especialidad);
                   
                    //si los nombres del doctor y cmp coinciden
                    if((req.body.name.toLowerCase()==datosCMP.nombres.toLowerCase()&&(req.body.lastname.toLowerCase()==datosCMP.apellidos.toLowerCase()))){
                    //creamos el nuevo docotor y guaardamos sus datos
                    var newDoctor = new Doctor({
                      username: req.body.username,
                      password: req.body.password,
                      email: req.body.email,
                      name: req.body.name,
                      lastname: req.body.lastname,
                      dni: req.body.dni,
                      edad: req.body.edad,
                      celular: req.body.celular,
                      cmp: req.body.cmp,
                      profesion: req.body.profesion,
                    })
                    //agregamos el atributo especialidad del doctor agregamos aparte por que especialidad es un Objeto encontrado en la base de datos
                    newDoctor.especialidad=especialidad;
                    // guardamos doctor registrado
                      await newDoctor.save(function(err) {
                        //error al guardar al doctor
                        if (err) {
                          return res.json({success: false, msg: 'Username ya existe'});
                        }
                        //si todo estuvo bien respondemos Json
                        res.json({success: true, msg: 'Bienvenido Doctor, es un nuevo usario.'});
                      });
                      console.log('--' +newDoctor); 
                      //guardamos especialidad
                      especialidad.doctor.push(newDoctor);
                      await especialidad.save();
                    }else{
                      res.json({msg: 'LLene los nombres y apellidos, completos y CORRECTOS del doctor'});
                    }
                  
                 
               }
             }catch(e){
              return res.status(400).json({
                msg: 'CMP INCORRECTO',
              })
            }
            
           });
          
        
      }
    }catch(e){
      console.log("ERR  "+e);
    }
    
  }
  //ingreso del doctor logeado
  exports.SigninDoctor =async function(req, res) {
      Doctor.findOne({
        email: req.body.email
      }, function(erro, doctor) {
        
        if (!doctor) {
          res.status(401).send({success: false, msg: 'LA AUTENTICACION FALLO USUARIO NO EXISTE'});
        } else {
          console.log('especialidad '+doctor.especialidad)
          // comparando password verificando 
          console.log(req.body.password)
          doctor.comparePassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {
              console.log(doctor.id)
              // si el usuario se encuentra y la contraseña  es correcta, crea un token
              var token = jwt.sign(doctor.toJSON(), config.database.secretU, {
                expiresIn: 604800 // 1 week
              });
              // retornamos la informacion incluyendo el token como json
              res.json({success: true, token: 'Bearer ' + token});
            } else {
              res.status(401).send({success: false, msg: 'LA AUTENTICACION FALLO PASSWORD INCORRECTO '});
            }
          });
        }
      });
    
  }
  //salida del doctor
  exports.SignoutDoctor = function(req, res) {
    req.logout();
    res.json({success: true, msg: 'Sign out Doctor EXITOSA.'});
  }
  //obtener datos para el perfil del doctor
  exports.Obtener_datos_doctor = async function (req,res) {
    try{
        var token = getToken(req.headers);
        if (token) {
           if(req.user.id==req.params.id){
                console.log('doctor ? '/*+  req.doctor.id*/);    
                var doctor = await Doctor.findById(req.params.id);
                res.send(doctor);
           }else{
             
            res.send('NO ES EL USUARIO    ' +   req.user.id + ' username :  ' + req.user.username + '  comparando con ' + req.params.id);
            }
        }else{
            return res.status(403).send({success: false, msg: 'Unauthorized.'});
             }
    }catch(error){
        console.log('ERRORCITO  '+error);
    }

  }
  //actualizar datos del doctor
  exports.Actualizar_datos_doctor =  async function (req,res) {
    try{
      var token = getToken(req.headers);
      if (token) {
      await Doctor.findById(req.user.id,async (err,doctor)=>{
        if(err){ console.log('usuario no encontrado aqui el error: '+ err);
        }else {
          console.log(doctor);
          doctor.email=req.body.email;
          doctor.celular=req.body.celular;
          await doctor.save((err,doctorUpdate)=>{
            if (err) {
              res.send('error al guardar al doctor actualizado :'+err);
            } else {
              res.json(doctorUpdate);
            }
          });
        }
      });
      }else{
        return res.status(403).send({success: false, msg: 'Unauthorized.'});
      }
    }catch(err){
      console.error('ERRRRORRRRRRR--------------------------------' + err)
    }
  
  }

  //agregar stack de horarios
  exports.Agregar_horario_doctor = async function(req,res){
   try{
      var token = getToken(req.headers);
      if (token) {
          var doctor = await Doctor.findById(req.user.id)
            console.log(doctor);
              var horarioEncontrado= await Horario.findOne({fecha:req.body.fecha,hora_inicio:req.body.hora_inicio,hora_fin:req.body.hora_fin,doctor: doctor});
              if(horarioEncontrado){
                  res.json({msg:'YA EXISTE ESE HORARIO PARA EL DOCTOR'});
              }else{
                  console.log('puedes poner horario');
                  //nuevo horario agarramos por body los datos
                   var newhorario = new Horario({
                      fecha: req.body.fecha,
                      hora_inicio: req.body.hora_inicio,
                      hora_fin: req.body.hora_fin
                    });
                  //agregamos el doctor del horario gracias al token
                  newhorario.doctor = doctor;
                  console.log('nuevo horario --- : '+newhorario);
                  //guardamos horario
                  await  newhorario.save((err,horario)=>{
                  if (err) {
                      res.send('error al guardar al horario :'+err);
                  } else {
                      console.log('se guardo horario: ');
                      res.status(200).json({msg: 'nuevo horario guardado'});
                  }
                  });
                  //pusheamos el areglo de horarios del doctor
                  doctor.horario.push(newhorario);
                  //guardamos dooctor actualizado
                  await doctor.save();
                  }

                 
      }else{
        return res.status(403).send({success: false, msg: 'Unauthorized.'});
      }
    }catch(err){
      console.error('ERRRRORRRRRRR--------------------------------' + err)
      throw err
    }
  }
  


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

