var passport = require("passport");
var config = require("../database/key");
require("../config/userpassport")(passport);
var jwt = require("jsonwebtoken");
var Doctor = require("../models/doctor");
var Especialidad = require("../models/especialidad");
var Horario = require("../models/horario");
var pup = require("../tools/scrapers");
var Cita = require("../models/cita");
var User = require("../models/user");
var Receta = require("../models/receta");
const chalk = require("chalk");
const logger = console.log;

//registro doctor
exports.SignupDoctor = async function (req, res) {
  try {
    if (!req.body.username || !req.body.password || !req.body.email) {
      res.json({
        success: false,
        msg: "Por favor, ponga nombre de usuario y contraseña",
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
            var especialidad = await Especialidad.findOne({
              especialidad: req.body.especialidad,
            });

            logger(chalk.blue("Encontro datos CMP"));
            logger(
              chalk.blue("Datos obtenidos: ") + chalk.green(datosCMP.nombres)
            );

            logger(chalk.blue("Especialidad:") + chalk.green(especialidad));

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
                celular: req.body.celular,
                cmp: req.body.cmp,
                profesion: req.body.profesion,
              });
              //agregamos el atributo especialidad del doctor agregamos aparte por que especialidad es un Objeto encontrado en la base de datos
              newDoctor.especialidad = especialidad;
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
              await especialidad.save();
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
  } catch (e) {
    logger(chalk.red("ERR  ") + chalk.white(e));
  }
};
//ingreso del doctor logeado
exports.SigninDoctor = async function (req, res) {
  Doctor.findOne(
    {
      email: req.body.email,
    },
    function (erro, doctor) {
      if (!doctor) {
        res.status(401).send({
          success: false,
          msg: "LA AUTENTICACION FALLO USUARIO NO EXISTE",
        });
      } else {
        logger(chalk.blue("especialidad ") + chalk.green(doctor.especialidad));
        // comparando password verificando
        logger(chalk.blue("Password:") + chalk.green(req.body.password));
        doctor.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            logger(chalk.blue("ID:")+ chalk.green(doctor.id));
            // si el usuario se encuentra y la contraseña  es correcta, crea un token
            var token = jwt.sign(doctor.toJSON(), config.database.secretU, {
              expiresIn: 604800, // 1 week
            });
            // retornamos la informacion incluyendo el token como json
            res.json({
              success: true,
              id: doctor._id,
              token: "Bearer " + token,
            });
          } else {
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
//salida del doctor
exports.SignoutDoctor = function (req, res) {
  req.logout();
  res.json({ success: true, msg: "Sign out Doctor EXITOSA." });
};
//obtener datos para el perfil del doctor
exports.Obtener_datos_doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("doctor: ") +chalk.green(req.doctor.id) );
        var doctor = await Doctor.findById(req.params.id).populate(
          "especialidad"
        );
        res.send(doctor);
      } else {
        logger(
          chalk.blue("NO es el usuario ") +
            chalk.green(req.user.id) +
            chalk.blue("comparado con ") +
            chalk.magenta(req.params.id)
        );
        res.send(
          "NO ES EL USUARIO    " +
            req.user.id +
            " username :  " +
            req.user.username +
            "  comparando con " +
            req.params.id
        );
      }
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (error) {
    logger(chalk.red("ERROR:  ") + chalk.white(error));
  }
};
//
exports.Obtener_horario_doctor = async function (req, res) {
  try {
    var doctor = await Doctor.findById(req.params.id).populate("horario");
    res.json(doctor.horario);
  } catch (error) {
    res.json({ msg: "id incorrecto, no se encontro doctor" });
  }
};
//actualizar datos del doctor
exports.Actualizar_datos_doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await Doctor.findById(req.user.id, async (err, doctor) => {
          if (err) {
            logger(chalk.blue("usuario no encontrado aqui el error: ") + chalk,red(err));
          } else {
            logger(chalk.blue("Doctor: ")+ chalk.green(doctor));
            doctor.email = req.body.email;
            doctor.celular = req.body.celular;
            doctor.edad = req.body.edad;

            await doctor.save((err, doctorUpdate) => {
              if (err) {
                logger(chalk.red("Error al guardar"));
                res.send("error al guardar al doctor actualizado :" + err);
              } else {
                res.json(doctorUpdate);
              }
            });
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
    logger(chalk.red("ERROR:") + chalk.white(err));
  }
};
//agregar stack de horarios
exports.Agregar_horario_doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        var doctor = await Doctor.findById(req.user.id);
        logger(chalk.blue("Doctor:") + chalk.green(doctor));
        var horarioEncontrado = await Horario.findOne({
          fecha: req.body.fecha,
          hora_inicio: req.body.hora_inicio,
          hora_fin: req.body.hora_fin,
          doctor: doctor,
        });
        if (horarioEncontrado) {
          res.json({ msg: "YA EXISTE ESE HORARIO PARA EL DOCTOR" });
        } else {
          logger(chalk.red("puedes poner horario"));
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
              res.send("error al guardar al horario :" + err);
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
    throw err;
  }
};
//cambiar esado de citas de pendientes a : atendido o a no atendido
exports.Cambiar_estado_citas = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await Cita.findOne({ _id: req.body.id_cita }, (err, cita) => {
          if (err) {
            logger(chalk.red("CITA NO ENCONTRADA"));
            res.json({ msg: "no se encontro la cita" });
          } else {
            //cambiamos el estado de la cita
            cita.estado = req.body.estado;
            //guardamos los cambios de la cita
            cita.save((erro, cita) => {
              if (erro) {
                logger(chalk.red("ERROR AL GUARDAR"));
                res.json({ msg: "No se pudo guardar el estado" });
              } else {
                logger(chalk.red("ESTADO GUARDADO"));
                res.json({ msg: "Estado guardado", estado: cita.estado });
              }
            });
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
    logger(chalk.red("ERROR")+chalk.white(err));
    
    throw err;
  }
};
//listar citas Doctor
exports.Obtener_Citas_Doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("obtener Citas :  ") + chalk.green(req.user.id));
        await Cita.find({ doctor: req.user.id }, (err, citas) => {
          if (err) {
            logger(chalk.red("CITA NO ENCONTRADA"));
            res.json({ msg: "no encontro las cita" });
          } else {
            logger(chalk.blue("CITA ENCONTRADA: ")+chalk.magenta(citas.length));
            res.status(200).json(citas);
          }
        })
          .populate("horario")
          .populate("especialidad")
          .populate("doctor")
          .populate("user");
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
    logger(chalk.red("ERROR: ")+ chalk.white(err));
  }
};


//el obtendra los datos de la cita para colocarlas por defecto a la receta
exports.Enviar_Datos_Nueva_Receta = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if(req.user.id == req.params.id) {
        //Encontrando al docotor que esta haciendo la cita
        await Doctor.findById(req.user.id,async(err,doctor)=>{
          try {
              if (err){
                logger(chalk.red("ERR ")+ chalk.white("no se encontro el doctor"));
              }else{
                //mensaje encontrando al doctor
                logger(chalk.blue("mensaje: ")+ chalk.green("se encontro al doctor: ")+ chalk.magenta(doctor.lastname));
                //encontrando cita por ID mandado por Body 
                await Cita.findById(req.body.id_cita,async(err,cita)=>{
                  try {
                    if (err){
                      logger(chalk.red("ERR ")+ chalk.white("no se encontro la cita"));
                      logger(chalk.red("ERR ")+ chalk.white(err));
                      res.send({msg:"cita no colocada"})
                    }else{
                      await User.findById(cita.user,async (err,paciente)=>{
                        try {
                          await Horario.findById(cita.horario,(err,horario)=>{
                            console.log(chalk.blue("nombre del paciente de la receta: ")+chalk.yellow(paciente.username))
                            console.log(chalk.blue("nombre del doctor de la receta: ")+chalk.yellow(doctor.username))
                            res.json({receta:"OK",paciente:paciente.username,doctor:doctor.username,horario:"De "+horario.hora_inicio +" hasta "+horario.hora_fin,fecha:horario.fecha})
                          })
                      } catch (error) {
                        logger(chalk.red("ERROR: ")+ chalk.white(error));
                        res.send({msg:"ERROR: "+error})
                      }
                      })
                    }
                  } catch (error) {
                    logger(chalk.red("ERROR: ")+ chalk.white(error));
                    res.send({msg:"ERROR: "+error})
                  }
                })
              }
          } catch (error) {
            logger(chalk.red("ERROR: ")+ chalk.white(error));
            res.send({msg:"ERROR: "+error})
          }
          
        })

      }else{
        logger(
        chalk.blue("NO es el usuario ") + chalk.green(req.user.id) + 
        chalk.blue("comparado con ") + chalk.magenta(req.params.id)
        );
        res.send(
            "NO ES EL USUARIO   " + req.user.id +
            " comparando con " + req.params.id
        );
      }
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    logger(chalk.red("ERROR: ")+ chalk.white(err));
  }
};
//creacion de la receta
exports.Crear_Nueva_Receta = async function(req, res){
  try {
    var token = getToken(req.headers);
    if (token) {
      if(req.user.id == req.params.id) {
        //generando nueva receta
        var receta = new Receta({
          medicina: req.body.medicina,
          indicaciones: req.body.indicaciones,
          nombredoctor: req.body.nombredoctor,
          nombrepaciente: req.body.nombrepaciente,
          horario: req.body.horario,
          fecha: req.body.fecha
        });
        await Cita.findById(req.body.id_cita,async(err,cita)=>{
          try {
            if(err){
              logger(chalk.red("ERR ")+ chalk.white("no se encontro la Cita"));
            }else{
              //guardamos la receta en la cita
              cita.receta = receta;
              //guardamos la cita en la receta
              receta.cita = cita;
              //save
              await cita.save();
              await receta.save();
              res.send({msg:"receta creada"})
            }
          } catch (error) {
            logger(chalk.red("ERROR: ")+ chalk.white(error));
            res.send({msg:"ERROR: "+error})
          }
          
        })

      }else{
        logger(
        chalk.blue("NO es el usuario ") + chalk.green(req.user.id) + 
        chalk.blue("comparado con ") + chalk.magenta(req.params.id)
        );
        res.send(
            "NO ES EL USUARIO   " + req.user.id +
            " comparando con " + req.params.id
        );
      }
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    logger(chalk.red("ERROR: ")+ chalk.white(err));
    res.send({msg:"ERROR: "+err})
  } 
};

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
