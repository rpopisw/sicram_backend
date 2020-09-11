//OBTENIENDO DATOS DEL MODEL
var User = require("../models/user");
var Cita = require("../models/cita");
var Doctor = require("../models/doctor");
var Especialidad = require("../models/especialidad");
var Horario = require("../models/horario");
var optk = require("../tools/opentok");
const chalk = require("chalk");
const loggerwin = require('../utils/logger_winston.js')
const logger = console.log;
//generar nueva citas
exports.GenerarNuevaCita = async function (req, res) {  
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //creando nueva cita
        var nuevacita = new Cita();
        //encontrando al usuario por parametro
        var paciente = await User.findById(req.params.id);
        logger(chalk.green(paciente.username)); 
        //econtrando al doctor por parametro
        /*var doctor = */await Doctor.findById(req.body._iddoctor,async(err,doctor) =>{
          try {
            logger(chalk.green(doctor.username));
            //encontrando especialidad
            /*var especialidad = */
            await Especialidad.findOne({
            especialidad: req.body.especialidad,
            },async(err,especialidad)=>{
              try {
                    //si especialidad existe
                    if (especialidad) {
                      logger(
                        chalk.green(especialidad._id) +
                          chalk.blue("  COMPARA  ") +
                          chalk.magenta(doctor.especialidad)
                      );
                      //si especialidad es la del doctor
                      if (doctor.especialidad.equals(especialidad._id)) {
                        var horario = await Horario.findOne({
                          fecha: req.body.fecha,
                          hora_inicio: req.body.hora_inicio,
                          hora_fin: req.body.hora_fin,
                          doctor: doctor,
                          
                        });
                        //si horario exisete
                        if (horario) {
                          if (horario.cita) {
                            logger(chalk.red("HORARIO USADO"));
                            res.json({ msg: "HORARIO YA ESTA USADO ", cita: horario.cita });
                          } else {
                            logger(chalk.blue("HORARIO: ") + chalk.green(horario));
                            //horario estara ocupado
                            horario.ocupado = true;
                            //agregando el doctor y el usuario a la nueva cita
                            nuevacita.user = paciente;
                            nuevacita.doctor = doctor;
                            nuevacita.especialidad = especialidad;
                            nuevacita.horario = horario;
                            
                            //agregamos el token y la session a la citanueva
                            await optk.createSession(async(err, session)=>{
                              try {
                                if (err) {
                                  logger(chalk.red("ERROR: ")+ chalk.white(err));
                                }else{
                                    logger(chalk.blue("sessionID: ")+ chalk.magenta(session.sessionId));
                                    var sessiontoken = optk.generateToken(session.sessionId);
                                    logger(chalk.blue("sessiontoken: ")+ chalk.magenta(sessiontoken));
                                    var aulaVirtual ={
                                      sessionId:session.sessionId,
                                      sessionToken:sessiontoken
                                    };
                                    logger(chalk.blue("aulavirtual: ")+ chalk.magenta(aulaVirtual.sessionId));
                                    nuevacita.aulaVirtual = {
                                      sessionId:session.sessionId,
                                      sessionToken:sessiontoken
                                    }
                                    logger(chalk.blue("aulavirtual: ")+ chalk.magenta(nuevacita.aulaVirtual));
                                     //guardamos nueva cita con su doctor y su usuario respectivo
                                    await nuevacita.save(function (err) {
                                      if (err) {
                                        return res.json({
                                          success: false,
                                          msg: "Error al guardar la cita",
                                        });
                                      }
                                      res.json({ success: true, msg: "Exito nueva cita creada." });
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
                                }
                              } catch (error) {
                                logger(chalk.red("ERROR: ") + chalk.white(error));
                                res.status(400).json({ msg: "ERROR"+error });
                              }   
                          });
                           
                          }
          
                        // res.send(nuevacita);  me sale error de cabecera si hago res.send
                      } else {
                        logger(chalk.red("HORARIO NO COINCIDE "));
                        res.json({ msg: "HORARIO NO COINCIDE" });
                      }
                    } else {
                      logger(chalk.red("ESPECIALIDAD NO COINCIDE "));
                      res.json({ msg: "La especialidad del doctor no coincide" });
                    }
                  } else {
                    logger(chalk.red("HORARIO NO ENCONTRADA"));
                    res.status(400).json({ msg: "especialidad no encontrada" });
                  }
              } catch (error) {
                logger(chalk.red("ERROR: ") + chalk.white(error));
                res.status(400).json({ msg: "ERROR"+error });
              }
            });
            
          } catch (error) {
            logger(chalk.red("ERROR: ") + chalk.white(error));
            res.status(400).json({ msg: "ERROR"+error });
          }
        })
        
      } else {
        logger(
          chalk.blue("NO es el usuario ") +
            chalk.green(req.user.id) +
            chalk.blue("comparado con ") +
            chalk.magenta(req.params.id)
        );
        res.send(
          "NO ES EL USUARIO   " +
            req.user.id +
            " comparando con " +
            req.params.id
        );
      }
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    logger(chalk.red("ERROR: ") + chalk.white(err));
    loggerwin.info(err);
    logger(chalk.green(req.body._iddoctor));
    res.status(400).json({ msg: "Codigo Doctor no encontrado" });
  }
};

//obtener nuevas citas
exports.Obtener_Citas_Paciente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("obtener Cita :  ") + chalk.green(req.user.id));
        await Cita.find({ user: req.user.id }, (err, citas) => {
          if (err) {
            logger(chalk.red("Cita no encontrada"));
            res.json({ msg: "no encontro las cita" });
          } else {
            res.status(200).json(citas);
          }
        })
          .populate("horario")
          .populate("especialidad")
          .populate("doctor");
      } else {
        logger(
          chalk.blue("NO es el usuario ") +
            chalk.green(req.user.id) +
            chalk.blue("comparado con ") +
            chalk.magenta(req.params.id)
        );
        res.send(
          "NO ES EL USUARIO   " +
            req.user.id +
            " comparando con " +
            req.params.id
        );
      }
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR  ") + chalk.white(err));
  }
};

//ACTUALIZAR CITAS MEDIANTE ASYNC AWAIT para que el servidor espere por esta accion
exports.Actualizar_Citas = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //encontramos la cita por su codigo
        await Cita.findById(req.body.id_cita, async (error, cita) => {
          try {
            if (!cita) {
              logger(chalk.red("chita no encontrada"));
              res.json({ msg: "cita no encontrada" });
            } else {
              logger("codigo usuario: " + cita.user)

              
              await User.findById(cita.user, async (err, paciente)=>{
                try {
                  if (!paciente) {
                    logger(chalk.red("no se encontro paciente de la cita"));
                    res.json({ msg: "no se encontro paciente de la cita" });
                  }{
                    await Doctor.findById(cita.doctor, async (err, doctor)=>{
                      try {
                        if (!doctor) {
                          logger(chalk.red("no se encontro doctor de la cita"));
                          res.json({ msg: "no se encontro doctor de la cita" });
                        }{
                          await Horario.findById(cita.horario, async (err,horario1) => {
                            try {
                              if (!horario1){
                                logger(chalk.red("no se encontro horario de la cita"));
                                res.json({ msg: "no se encontro horario de la cita" });
                              }{
                                
                                await Doctor.findById(req.body._iddoctor, async (err, doctor2)=>{
                                  try {
                                    if (!doctor2) {
                                      logger(chalk.red("nuevo doctor no encontrado"));
                                      res.json({ msg: "nuevo doctor no encontrado" });
                                    }{
                                      await Especialidad.findOne({especialidad: req.body.especialidad},async (err, especialidad)=>{
                                        try {
                                          if (!especialidad) {
                                            logger(chalk.red("no se encontro especialidad"));
                                            res.json({ msg: "no se encontro especilidad" });
                                          }else{
                                            if (doctor2.especialidad.equals(especialidad._id)) {
                                              await Horario.findOne({
                                                fecha: req.body.fecha,
                                                hora_inicio: req.body.hora_inicio,
                                                hora_fin: req.body.hora_fin,
                                                doctor: doctor2,
                                              },async (err, horario)=>{
                                                try {
                                                  if (!horario) {
                                                    logger(chalk.red("HORARIO NO COINCIDE "));
                                                    res.json({ msg: "HORARIO NO COINCIDE" });
                              
                                                  }else{
                                                    if(horario.ocupado = true){
                                                      logger(chalk.red("HORARIO USADO"));
                                                      res.json({ msg: "HORARIO YA ESTA USADO ", cita: horario.cita });
                                                    }else{
                                                      //---------------sacando cita de paciente actual--
                                                        const pacientes_cita_tmp = paciente.cita;
                                                        const find_index = pacientes_cita_tmp.indexOf(cita._id);
                                                        //sacamos la cita del paciente
                                                        pacientes_cita_tmp.splice(find_index, 1);
                              
                                                        //---------------sacando cita de doctor actual--
                                                        const doctor_cita_tmp = doctor.cita;
                                                        const find_index_doctor = doctor_cita_tmp.indexOf(cita._id);
                                                        //sacamos la cita del doctor
                                                        doctor_cita_tmp.splice(find_index_doctor, 1);
                              
                                                        //---------------sacando cita de horario actual y desocupando horario--
                                                        horario1.ocupado = false
                                                        horario1.cita = null;
                                                        //---------------sacando especilidad de la cita--
                                                        horario1.especialidad=null;
                              
                                                        //paciente.save()
                                                        doctor.save()
                                                        horario1.save()
                                                        //cita.save()

                                                      logger(chalk.blue("HORARIO: ")+ chalk.green( horario));
                                                      //horario estara ocupado
                                                      horario.ocupado = true;
  
                                                      cita.user = paciente
                                                      cita.doctor = doctor2
                                                      cita.especialidad = especialidad
                                                      cita.horario = horario
                                                      
                                                      await cita.save(function (err) {
                                                        if (err) {
                                                          return res.json({
                                                            success: false,
                                                            msg: "Error al guardar la cita",
                                                          });
                                                        }
                                                        res.json({ msg: "cita actualizada", cita: cita });
                                                      });
                                                      //agregamos la cita para el usuario.
                                                        paciente.cita.push(cita);
                                                        //agregamos la cita para el doctor
                                                        doctor2.cita.push(cita);
                                                        //guardamos al user con su cita
                                                        await paciente.save();
                                                        //guardamos al doctor con su cita
                                                        await doctor2.save();
                                                        //guardamos la cita en el horario
                                                        horario.cita = cita;
                                                        //guardamos al horario con su cita
                                                        await horario.save();
                                                    }
                                                  }
                                                  
                                                } catch (error) {
                                                  logger(chalk.red("ERROR: ") + chalk.white(error))
                                                  throw error;
                                                }
                                              });
                                           
                                            } else {
                                              logger(chalk.red("Especialidad no coincide"))
                                              res.json({ msg: "La especialidad del doctor no coincide" });
                                            }
                                          }
                                        } catch (error) {
                                          logger(chalk.red("ERROR: ") + chalk.white(error))
                                          throw error;
                                        }
                                      })
                                    }
                                  } catch (error) {
                                    logger(chalk.red("ERROR: ") + chalk.white(error))
                                    throw error;
                                  }
                                  
                                })
                                
                              }
                            } catch (error) {
                              logger(chalk.red("ERROR: ") + chalk.white(error))
                              throw error;
                            }
                            
                          })
                        }
                      } catch (error) {
                        logger(chalk.red("ERROR: ") + chalk.white(error))
                        throw error;
                      }
                      
                    })
                  }
                } catch (error) {
                  logger(chalk.red("ERROR: ") + chalk.white(error))
                  throw error;
                }
                
              })
              /*
              //encontramos al paciente de la cita
              
              const paciente = await User.findById(cita.user );
              const pacientes_cita_tmp = paciente.cita;
              const find_index = pacientes_cita_tmp.indexOf(cita._id);
              //sacamos la cita del paciente
              pacientes_cita_tmp.splice(find_index, 1);
              
              //encontramos al doctor de la cita
              const doctor = await Doctor.findById(cita.doctor);
              const doctor_cita_tmp = doctor.cita;
              const find_index_doctor = doctor_cita_tmp.indexOf(cita._id);
              //sacamos la cita del doctor
              doctor_cita_tmp.splice(find_index_doctor, 1);
  
              //encontramos al horario de la cita del doctor
              const horario1 = await Horario.findById(cita.horario)
              horario1.ocupado = false
              horario1.cita = null;
  
              //guardando cambios y elimando cita
              paciente.save()
              doctor.save()
              horario1.save()
              await cita.remove();
  
              logger(chalk.blue("Obteniendo del body") + chalk.green(req.body));
              //creando nueva cita
              var nuevacita = new Cita();
              //encontrando al usuario por parametro
              var paciente2 = await User.findById(req.params.id); //deberia ser metido por parametro
              logger(
                chalk.blue("Username del paciente:") +
                chalk.green(paciente.username)
              );
              //econtrando al doctor por parametro
              var doctor2 = await Doctor.findById(req.body._iddoctor); 
              logger(
                chalk.blue("Username del médico") + chalk.green(doctor2.username)
              );
              //encontrando especialidad
              var especialidad = await Especialidad.findOne({
                especialidad: req.body.especialidad,
              });
              //si especialidad es true
              if (especialidad) {
                logger(
                  chalk.green(especialidad._id) +
                    chalk.blue("  COMPARA  ") +
                    chalk.magenta(doctor2.especialidad)
                );
                //si especialidad es la del doctor
                if (doctor.especialidad.equals(especialidad._id)) {
                  var horario = await Horario.findOne({
                    fecha: req.body.fecha,
                    hora_inicio: req.body.hora_inicio,
                    hora_fin: req.body.hora_fin,
                    doctor: doctor2,
                  });
                  //si horario es true
                  if (horario) {
                    logger(chalk.blue("HORARIO: " )+ chalk.green( horario));
                    //horario estara ocupado
                    horario.ocupado = true;
                    //agregando el doctor y el usuario a la nueva cita
                    nuevacita.user = paciente2;
                    nuevacita.doctor = doctor2;
                    nuevacita.especialidad = especialidad;
                    nuevacita.horario = horario;
                    //guardamos nueva cita con su doctor y su usuario respectivo
                    await nuevacita.save(function (err) {
                      if (err) {
                        loggerwin.info(err);
                        return res.json({
                          success: false,
                          msg: "Error al guardar la cita",
                        });
                      }
                      res.json({
                        success: true,
                        msg: "Exito nueva cita creada.",
                      });
                    });
                    //agregamos la cita para el usuario.
                    paciente2.cita.push(nuevacita);
                    //agregamos la cita para el doctor
                    doctor2.cita.push(nuevacita);
                    //guardamos al user con su cita
                    await paciente2.save();
                    //guardamos al doctor con su cita
                    await doctor2.save();
                    //guardamos la cita en el horario
                    horario.cita = nuevacita;
                    //guardamos al horario con su cita
                    await horario.save();
  
                    // res.send(nuevacita);  me sale error de cabecera si hago res.send
                  } else {
                    logger(chalk.red("HORARIO NO COINCIDE "));
                    res.json({ msg: "HORARIO NO COINCIDE" });
                  }
                } else {
                    logger(chalk.red("Especialidad no coincide"))
                  res.json({ msg: "La especialidad del doctor no coincide" });
                }
              } else {
                res.status(400).json({ msg: "especialidad no encontrada" });
              }*/
            }
          } catch (error) {
            logger('ERROR'+ error)
            throw error;
          }
          
        });
      } else {

        res.send(
          "NO ES EL USUARIO   " +
            req.user.id +
            " comparando con " +
            req.params.id
        );
        logger(
            chalk.blue("NO es el usuario ") +
              chalk.green(req.user.id) +
              chalk.blue("comparado con ") +
              chalk.magenta(req.params.id)
          );
      }
    } else {
      loggerwin.info("Sin autorizacion");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    console.log("ERROR  " + err);
  }
};

exports.Eliminar_cita = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //encontramos la cita por su codigo
        await Cita.findOne({ _id: req.body.id_cita }, async (error, cita) => {
          if (error) {
            res.json({ msg: "cita no encontrada" });
          } else {
            const paciente = await User.findOne({ _id: req.params.id });
            const pacientes_cita_tmp = paciente.cita;
            const find_index = pacientes_cita_tmp.indexOf(req.body.id_cita);
            pacientes_cita_tmp.splice(find_index, 1);

            await paciente.updateOne(
              { _id: req.params.id },
              { $set: { cita: pacientes_cita_tmp } }
            );

            const doctor = await Doctor.findOne({ _id: cita.doctor });
            const doctor_cita_tmp = doctor.cita;
            const find_index_doctor = doctor_cita_tmp.indexOf(req.body.id_cita);
            doctor_cita_tmp.splice(find_index_doctor, 1);
            
            //desocupando horario de cita eliminada
            const horario = await Horario.findOne({ cita: cita._id})
            
            logger('horario ocupado: '+horario.ocupado)
            horario.ocupado = false
            horario.cita=null;
            horario.save();
            logger('se elimina la cita LUEGO')
            logger('horario ocupado: '+horario.ocupado)
            await doctor.updateOne(
              { _id: cita.doctor },
              { $set: { cita: doctor_cita_tmp } }
            );

            await cita.remove();
            paciente.save()
            doctor.save()

            res.json({ msg: "cita eliminada" ,horario:horario,doctor:doctor,paciente:paciente});
          }
        });
      } else {
        logger(
            chalk.blue("NO es el usuario ") +
              chalk.green(req.user.id) +
              chalk.blue("comparado con ") +
              chalk.magenta(req.params.id)
          );
        res.send(
          "NO ES EL USUARIO   " +
            req.user.id +
            " comparando con " +
            req.params.id
        );
      }
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR  ") + chalk.white(err));
  }
};

//ELIMINANDO CITAS DE LA MISMA FORMA CON ASYNC AWAIT
exports.Eliminar_cita_prueba = async function (req, res) {
  try {
    //encontramos la cita por su codigo
    await Cita.findOne({ _id: req.body.id }, async (error, cita) => {
      if (error) {
          logger(chalk.red("Cita no encontrada"));
        res.json({ msg: "cita no encontrada" });
      } else {
        const paciente = await User.findOne({ _id: req.body.id_usuario });
        const pacientes_cita_tmp = paciente.cita;
        const find_index = pacientes_cita_tmp.indexOf(req.body.id);
        pacientes_cita_tmp.splice(find_index, 1);

        await paciente.updateOne(
          { _id: req.body.id_usuario },
          { $set: { cita: pacientes_cita_tmp } }
        );

        const doctor = await Doctor.findOne({ _id: req.body.id_doctor });
        const doctor_cita_tmp = doctor.cita;
        const find_index_doctor = doctor_cita_tmp.indexOf(req.body.id);
        doctor_cita_tmp.splice(find_index_doctor, 1);

        await doctor.updateOne(
          { _id: req.body.id_doctor },
          { $set: { cita: doctor_cita_tmp } }
        );

        await cita.remove();

        res.json({ msg: "cita eliminada" });
      }
    });
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR  ") + chalk.white(err));
  }
};

//metodo para confirmar que entro un token
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(" ");
    if (parted.length === 2) {
      logger(chalk.green(parted));
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
