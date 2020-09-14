var passport = require("passport");
var config = require("../database/key");
require("../config/userpassport")(passport);
var jwt = require("jsonwebtoken");
var Organizacion = require("../models/organizacion");
var pup = require("../tools/scrapers");
var Doctor = require("../models/doctor")
var Especialidad = require("../models/especialidad")
var Horario = require("../models/horario")
const loggerwin = require('../utils/logger_winston.js')
const chalk = require("chalk");

const logger = console.log;

exports.SignupOrganizacion = async function (req, res) {
  try {
    if (!req.body.username || !req.body.password || !req.body.email) {
      res.json({
        success: false,
        msg: "Por favor, ponga nombre de usuario y contraseña",
      });
    } else {
      //encontrando a la organizacion por su email.
      await Organizacion.findOne(
        { email: req.body.email },
        async (erro, org) => {
          if (org) {
            logger(
              chalk.blue("Email de la organizacion: ") + chalk.green(org.email)
            );
            res.status(401).json({ msg: "email ya esta siendo usado" });
          } else {
            var newOrg = new Organizacion({
              username: req.body.username,
              password: req.body.password,
              email: req.body.email,
              nameOrg: req.body.nameOrg,
              direccion: req.body.direccion,
              ruc: req.body.ruc,
            });
            //nueva especialidad q sera guardada en el stack de especialidades de la oganizacion
            /*var especialidad = await Especialidad.findOne({
               especialidad:req.body.especialidad
            })
            newOrg.especialidad.push(especialidad)*/

            await newOrg.save(function (error, newOrga) {
              if (error) {
                loggerwin.info("usuario ya existe");
                logger(chalk.red("Username en uso"));
                return res.json({ success: false, msg: "Username ya existe." });
              }
              res.status(200).json({
                success: true,
                msg: "Exito nuevo organizacion creado.",
              });
            });
          }
        }
      );
    }
  } catch (e) {
    loggerwin.info(e);
    logger(chalk.red("ERROR:  ") + chalk.white(e));
  }
};

exports.SigninOrganizacion = function (req, res) {
  Organizacion.findOne(
    {
      email: req.body.email,
    },
    function (err, org) {
      if (!org) {
        res.status(401).send({
          success: false,
          msg: "LA AUTENTICACION FALLO USUARIO NO EXISTE",
        });
      } else {
        // check if password matches
        logger(
          chalk.blue("Password de la organizacion: ") +
            chalk.green(org.password)
        );
        org.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            // si el usuario se encuentra y la contraseña  es correcta, crea un token
            logger(chalk.blue("ID de la organizcion: ") + chalk.green(org.id));
            var token = jwt.sign(org.toJSON(), config.database.secretU, {
              expiresIn: 604800, // 1 semana
            });
            logger(chalk.blue("ID de la organizcion: ") + chalk.green(org.id));
            // retornamos la informacion incluyendo el token como json
            res.json({ success: true, id: org._id, token: "Bearer " + token });
          } else {
            loggerwin.info("LA AUTENTICACION FALLO PASSWORD INCORRECTO ");
            res.status(401).send({
              success: false,
              msg: "LA AUTENTICACION FALLO PASSWORD INCORRECTO ",
            });
          }
        });
      }
    }
  );
};
//salir de la cuenta
exports.SignoutOrganizacion = function (req, res) {
  req.logout();
  res.json({ success: true, msg: "Sign out Exitosa." });
};

exports.Obtener_Datos_Organizacion = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("ORGANIZACION:   ") + chalk.green(req.user.id));
        var org = await Organizacion.findById(req.params.id);
        res.send(org);
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
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR: ") + chalk.white(err));
  }
};

exports.Actualizar_Datos_Organizacion = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //verificar que por parametro colacaste el usuario de la organizacion

        //---------------------------------------------------------------
        await Organizacion.findById(req.user.id, async (err, org) => {
          if (err) {
            logger(
              chalk.blue("usuario no encontrado aqui el error: ") +
                chalk.red(err)
            );
          } else {
            logger(chalk.blue("Organizacion: ") + chalk.green(org));
            //DATOS A ACTUALIZAR---------------------------
            org.email = req.body.email;
            org.nameOrg = req.body.nameOrg;
            org.direccion=req.body.direccion;
            //--------------------------------------------
            await org.save((err, orgUpdate) => {
              if (err) {
                logger(
                  chalk.blue("Error al guardar paciente :" + chalk.red(err))
                );
              } else {
                res.json(orgUpdate);
              }
            });
          }
        });
        //---------------------------------------------------------------
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
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERRROR: ")  + chalk.white(err));
  }
};

//AGREGAR DOCTOR EN ORGANIZACION tambien puede elegir las especialidades a las que se dirige
exports.Registrar_Doctor_En_Organization = async function (req, res) {
  try {
    console.log(req.headers)
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        if (!req.body.username || !req.body.password || !req.body.email) {
          res.json({
            success: false,
            msg: "Por favor, ponga nombre de usuario y contraseña del doctor",
          });
        } else {
          //encontrando al doctor por su email.
          await Doctor.findOne({ email: req.body.email }, async (erro, doctor) => {
            try {
              if (doctor) {
                logger(chalk.blue("Email: ") + chalk.green(doctor.email));
                res.status(401).json({ msg: "email ya esta siendo usado" });
              } else {
                //varaiable que contiene los datos del cmp encontrado
                const datosCMP = await pup.scrapeProduct(
                  "https://200.48.13.39/cmp/php/detallexmedico.php?id=" +
                    req.body.cmp
                );
                //encontramos especialidad 
                var especialidad = await Especialidad.findOne({
                  especialidad: req.body.especialidad,
                });
                //encontramos la organizacion qeue esta creando
                var organizacion = await Organizacion.findById(req.user.id)

                logger(chalk.blue("Encontro datos CMP"));
                logger(
                  chalk.blue("Datos obtenidos: ") + chalk.green(datosCMP.nombres)
                );

                logger(chalk.blue("Especialidad: ") + chalk.green(especialidad));
                logger(chalk.blue("Organizacion: ") + chalk.green(organizacion));
                //si los nombres del doctor y cmp coinciden
                if (
                  req.body.name.toLowerCase() == datosCMP.nombres.toLowerCase() &&
                  req.body.lastname.toLowerCase() ==
                    datosCMP.apellidos.toLowerCase()
                ) {
                  //creamos el nuevo docotor y guaardamos sus datos
                  var newDoctor = new Doctor({
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    name: req.body.name,
                    lastname: req.body.lastname,
                    dni: req.body.dni,
                    edad: req.body.edad,
                    genero: req.body.genero,
                    celular: req.body.celular,
                    cmp: req.body.cmp,
                    profesion: req.body.profesion,
                  });
                  //agregamos el atributo especialidad del doctor agregamos aparte por que especialidad es un Objeto encontrado en la base de datos
                  newDoctor.especialidad = especialidad;
                  newDoctor.organizacion = organizacion;
                  // guardamos doctor registrado
                  await newDoctor.save(function (err) {
                    //error al guardar al doctor
                    if (err) {
                      return res.json({
                        success: false,
                        msg: "Username ya existe",
                      });
                    }
                    //si todo estuvo bien respondemos Json
                    res.json({
                      success: true,
                      msg: "Bienvenido Doctor, es un nuevo usario.",
                    });
                  });
                  logger(chalk.blue("Nuevo médico: ") + chalk.green(newDoctor));
                  //guardamos especialidad
                  especialidad.doctor.push(newDoctor);
                  organizacion.doctor.push(newDoctor);
                  await especialidad.save();
                  //guardamos organizacion actualizada con su nuevo doctor
                  await organizacion.save();
                  
                } else {
                  res.json({
                    msg:
                      "LLene los nombres y apellidos, completos y CORRECTOS del doctor",
                  });
                }
              }
            } catch (e) {
              return res.status(400).json({
                msg: "CMP INCORRECTO",
              });
            }
          });
          
        }
      //---------------------------------------------------------------
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
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
  
  }catch (e) {
    loggerwin.info(e);
    logger(chalk.red("ERR  ") + chalk.white(e));
  }
}
exports.Obtener_Doctores_De_Organizacion = async function (req, res) {
  try {
    console.log(req.headers)
    var token = getToken(req.headers);
      if (token) {
        //TODO
      if (req.user.id == req.params.id) {
        await Doctor.find({organizacion:req.user.id},(err,doctor)=>{
          if (err){
            //si hay un error en la busqueda
            logger(chalk.red("ERR: ") + chalk.white(err));
            res.status(401).json({ msg: "ERR: "+err });
          }else{
            //ahora enviamos el docotor
            
            logger(chalk.blue("cantidad de doctores de la organizacion: ") + chalk.green(doctor.length));
            res.json(doctor);
          }
        }).populate('especialidad')
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
        return res.status(403).send({ success: false, msg: "Unauthorized." });
      }
  }catch (e) {
    loggerwin.info(e);
    logger(chalk.red("ERR  ") + chalk.white(e));
  }
}
exports.Asignar_Horario_Medicos = async function (req, res) {
  try {
    console.log(req.headers)
    var token = getToken(req.headers);
      if (token) {
        if (req.user.id == req.params.id) {
          //buscamos la organizacion
          /*await Organizacion.findById(req.user.id,async(err,organizacion) => {
            try {*/
              //buscamos doctor
              await Doctor.findById(req.body.id_doctor,async (err,doctor) => {
                try {
                  logger(chalk.blue("datos doctor: ") + chalk.green(doctor));
                if (!doctor) {
                  logger(chalk.blue("msg: ")+ chalk.white("no se encontro el doctor"));
                  res.status(400).json({ msg: "no se encontro el doctor" });
                }else{
                  //se encontro al doctor
                  logger(chalk.blue("Encontro Doctor: ") + chalk.green(doctor.lastname));
                  //condicion que el doctor pertenesca a la organizacion
                  if(doctor.organizacion!=req.user.id){
                    logger(chalk.blue("msg: ") + chalk.white("doctor: "+doctor.organizacion+" no coincide con organizacion: "+req.user.id));
                    res.status(400).json({ msg: "EL DOCTOR NO PERTENCE A LA ORGANIZACION" });
                  }else{
                    logger(chalk.blue("SI PERTENECE Doctor: ") + chalk.green(doctor.lastname));
                    //res.status(400).json({ msg: "SI PERTENECE" });
                    //AGREGAMOS EL HORARIO DEL DOCTOR
                    var horarioEncontrado = await Horario.findOne({
                      fecha: req.body.fecha,
                      hora_inicio: req.body.hora_inicio,
                      hora_fin: req.body.hora_fin,
                      doctor: doctor,
                    });
                    if (horarioEncontrado) {
                      res.json({ msg: "YA EXISTE ESE HORARIO PARA EL DOCTOR" });
                    } else {
                      logger(chalk.magenta("puedes poner horario"));
                      //nuevo horario agarramos por body los datos
                      var newhorario = new Horario({
                        fecha: req.body.fecha,
                        hora_inicio: req.body.hora_inicio,
                        hora_fin: req.body.hora_fin,
                      });
                      //agregamos el doctor del horario gracias al token
                      newhorario.doctor = doctor;
                      logger(chalk.blue("nuevo horario --- : ") + chalk.green(newhorario));
                      //guardamos horario
                      await newhorario.save((err, horario) => {
                        if (err) {
                          logger(chalk.red("Error al guardar horario"));
                          res.json({msg:"error al guardar al horario :" + err});
                        } else {
                          logger(chalk.blue("Se guardó el horario"));
                          res.status(200).json({ msg: "nuevo horario guardado" });
                        }
                      });
                      //pusheamos el areglo de horarios del doctor
                      doctor.horario.push(newhorario);
                      //guardamos dooctor actualizado
                      await doctor.save();
                    }
                  }
                }
                } catch (error) {
                  logger(chalk.red("ERROR: ") + chalk.white(error));
                }
              })
            /*} catch (error) {
              logger(chalk.red("ERROR: ") + chalk.white(error));
              res.status(400).json({ msg: "ERROR"+error });
            }
          })*/
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
  }catch (error) {
    loggerwin.info(error);
    logger(chalk.red("ERROR: ") + chalk.white(error));
  }
}
exports.Eliminar_Doctor = async function (req, res) {
  try {
    console.log(req.headers)
    var token = getToken(req.headers);
      if (token) {
        if (req.user.id == req.params.id) {
          //encontramos al doctor
          await Doctor.findById(req.body.id_doctor,async (err,doctor) => {
            try {
              logger(chalk.blue("datos doctor: ") + chalk.green(doctor));
            if (!doctor) {
              logger(chalk.blue("msg: ")+ chalk.white("no se encontro el doctor"));
              res.status(400).json({ msg: "no se encontro el doctor" });
            }else{

              if(doctor.cita.length>0){
                res.json({msg: "No puede eliminar un doctor con citas"});
              }
              //se encontro al doctor
              logger(chalk.blue("Encontro Doctor: ") + chalk.green(doctor.lastname));
              //condicion que el doctor pertenesca a la organizacion
              if(doctor.organizacion!=req.user.id){
                logger(chalk.blue("msg: ") + chalk.white("doctor: "+doctor.organizacion+" no coincide con organizacion: "+req.user.id));
                res.status(400).json({ msg: "EL DOCTOR NO PERTENCE A LA ORGANIZACION" });
              }else{
                logger(chalk.blue("SI PERTENECE Doctor: ") + chalk.green(doctor.username));
                //encontramos la organizacion q eliminara a un doctor
                await Organizacion.findById(req.user.id,(err,organizacion)=>{

                  if (!organizacion){
                    res.json({ msg: "NO SE ENCONTRO LA ORGANIZACION" });
                  }else{
                    const doctor_temp = organizacion.doctor
                    console.log("DOCTORES DE LA ORGA: "+ doctor_temp)
                    const index_doctor = doctor_temp.indexOf(doctor.id)
                    console.log("INDICE"+index_doctor)
                    doctor_temp.splice(index_doctor,1)
  
  
                    doctor.organizacion = null;
                    doctor.save()
                    organizacion.save()
                    res.json({ msg: "Doctor eliminado"});
                  }
                  
                })
              }
            }
            } catch (error) {
              logger(chalk.red("ERROR: ") + chalk.white(error));
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
  }catch (error) {
    loggerwin.info(error);
    logger(chalk.red("ERROR: ") + chalk.white(error));
  }
}

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