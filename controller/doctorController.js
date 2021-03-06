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
const mailer = require("../mail/mediador_mailer");

const loggerwin = require("../utils/logger_winston.js");
const horario = require("../models/horario");
const logger = console.log;

//para agregar en cloudinary nuestras imagenes
const cloudinary = require("../tools/cloudinary");
const fs = require("fs");

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
                genero: req.body.genero,
                email: req.body.email,
                name: req.body.name,
                lastname: req.body.lastname,
                dni: req.body.dni,
                edad: req.body.edad,
                celular: req.body.celular,
                cmp: req.body.cmp,
                profesion: req.body.profesion,
              });
              //notificamos al doctor
              mailer.notificarRegistro(
                `EXITO! en su registro de cuenta.\n\n
                Reciba los cordiales saludos de la familia SICRAM\n
                DOCTOR ${newDoctor.lastname}, ${newDoctor.name} \n
                Agradecemos su aporte en la familia SICRAM ahora podra ayudar a nuestros pacientes en sus consultas\n
                Solo necesita ingresar a su cuenta y agregue horarios de su disponibilidad
                con esto nuestros pacientes podran elegirlo para una consulta virtual.\n
                \n
                Doctor ${newDoctor.lastname}, recuerde que cuando un paciente registre una cita con usted
                automaticamente le llegara un correo de informacion de la cita, con sus detalles.\n\n\n
                Muchas Gracias Atentamente SICRAM  `,
                newDoctor
              );
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
          loggerwin.info("El usuario ingreso un cmp incorrecto ");
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
        loggerwin.info("El auntenticacion del usuario fallo");
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
            logger(chalk.blue("ID:") + chalk.green(doctor.id));
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
            loggerwin.info(
              "El auntenticacion del usuario fallo : password incorrecto"
            );
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
        var doctor = await Doctor.findById(req.params.id).populate(
          "especialidad"
        );
        logger(
          chalk.blue("doctor: ") +
            chalk.green(doctor.username + " " + doctor.lastname)
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
    loggerwin.info("No se pudo obtener los datos del doctor.");
    logger(chalk.red("ERROR:  ") + chalk.white(error));
  }
};

//HOARIOS DEL DOCTOR
exports.Obtener_horario_doctor = async function (req, res) {
  try {
    await Doctor.findById(req.params.id, async (err, doctor) => {
      await Horario.find(
        { doctor: req.params.id, ocupado: false },
        (err, horarios) => {
          if (!horarios) {
            res.json({ msg: "no se encontro horarios" });
          }
          res.json(horarios);
        }
      ).populate("doctor");
    });
  } catch (error) {
    loggerwin.info("id incorrecto, no se encontro doctor");
    res.json({ msg: "id incorrecto, no se encontro doctor" });
  }
};
exports.Obtener_horarios_ocupados_doctor = async function (req, res) {
  try {
    await Doctor.findById(req.params.id, async (err, doctor) => {
      await Horario.find(
        { doctor: req.params.id, ocupado: true },
        (err, horarios) => {
          if (!horarios) {
            res.json({ msg: "No se encontro horarios" });
          }
          res.json(horarios);
        }
      ).populate("doctor");
    });
  } catch (error) {
    loggerwin.info("id incorrecto, no se encontro doctor");
    res.json({ msg: "id incorrecto, no se encontro doctor" });
  }
};
exports.Eliminar_horario_doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //encotramos al doctor
        await Doctor.findById(req.params.id, async (err, doctor) => {
          if (!doctor) {
            res.json({ msg: "no se encontro doctor" });
          } else {
            //encontramos el horario a eliminar
            await Horario.findOne(
              { _id: req.body.id_horario, doctor: req.user.id },
              (err, horario) => {
                if (!horario) {
                  res.json({ msg: "horario no encontrado" });
                } else {
                  logger("id horario: " + horario.id);
                  const horarios_doctor = doctor.horario;
                  logger("horarios del doctor: " + horarios_doctor);
                  logger("id doctor: " + doctor.id);
                  const indice_temp_horario = horarios_doctor.indexOf(
                    horario.id
                  );
                  logger("indice del Horario: " + indice_temp_horario);
                  if (indice_temp_horario == -1) {
                    res.json({
                      msg: "Horario no pertenece a horarios del doctor",
                    });
                  } else {
                    
                    if (horario.ocupado == false) {
                      horarios_doctor.splice(indice_temp_horario, 1);
                      doctor.save();
                      horario.deleteOne();
                      res.json({ msg: "Se elimino el horario del doctor" });
                    } else {
                      res.json({
                        msg:
                          "El horario esta siendo usado en una cita, No se puede eliminar",
                      });
                    }
                  }
                }
              }
            );
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
    loggerwin.info("No se pudo obtener los datos del doctor.");
    logger(chalk.red("ERROR:  ") + chalk.white(error));
  }
};

//actualizar datos del doctor
exports.Actualizar_datos_doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await Doctor.findById(req.user.id, async (err, doctor) => {
          if (!doctor) {
            logger(
              chalk.blue("usuario no encontrado aqui el error: ") +
                chalk.red(err)
            );
          } else {
            //Buscamos la especialidad para borrar de esta al médico
            var especialidadEncontrada = await Especialidad.findById(
              doctor.especialidad
            );
            var nuevaEspecialidad = await Especialidad.findOne({
              especialidad: req.body.especialidad,
            });

            if (especialidadEncontrada != nuevaEspecialidad) {
              // Buscamos el médico dentro de la especialidad y hallamos el indice del array
              var indice = especialidadEncontrada.doctor.indexOf(doctor._id);
              // Con el índice que hallamos, ahora borramos ese doctor del array
              especialidadEncontrada.doctor.splice(indice, 1);
              // Guardamos los cambios y se actualiza con un doctor menos
              await especialidadEncontrada.save();
              doctor.especialidad = nuevaEspecialidad;
              //En la nueva especialidad pusheamos al doctor
              nuevaEspecialidad.doctor.push(doctor);
              await nuevaEspecialidad.save();
            }

            //Editamos datos del doctor
            doctor.email = req.body.email;
            doctor.celular = req.body.celular;
            doctor.edad = req.body.edad;

            await doctor.save((err, doctorUpdate) => {
              if (err) {
                logger(chalk.red("Error al guardar"));
                res.send("error al guardar al doctor actualizado :" + err);
              } else {
                res.json({
                  msg: "Doctor actualizado!",
                  doctor: doctorUpdate,
                });
              }
            });
          }
        }).populate("especialidad");
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
      loggerwin.info("Usuario no autorizado");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR:") + chalk.white(err));
  }
};
//agregar stack de horarios
exports.Agregar_horario_doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //encontramos doctor
        var doctor = await Doctor.findById(req.user.id);
        logger(chalk.blue("Doctor:") + chalk.green(doctor));
        //confirmando que este horario ya existe
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
    loggerwin.info(err);
    logger(chalk.red("ERROR: ") + chalk.white(err));
    throw err;
  }
};

// Actualizar el horario del doctor
exports.Actualizar_horario_doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await Horario.findById(req.body.horario_id, async (err, horario) => {
          if (!horario) {
            logger(
              chalk.blue("Horario no encontrado error: ") + chalk.red(err)
            );
          } else {
            //horario encontrado es la coincidencia con el horario que recién están introduciendo, esto sirve para que no hayan 2 horarios con la misma hora así tengan diferentes ids
            var horarioEncontrado = await Horario.findOne({
              fecha: req.body.fecha,
              hora_inicio: req.body.hora_inicio,
              hora_fin: req.body.hora_fin,
            });
            logger(
              "doctor del horario: " +
                horario.doctor._id +
                " es igual a: " +
                req.user.id
            );

            if (!horarioEncontrado) {
              if (horario.doctor._id == req.user.id) {
                if (horario.ocupado == false) {
                  horario.fecha = req.body.fecha;
                  horario.hora_inicio = req.body.hora_inicio;
                  horario.hora_fin = req.body.hora_fin;

                  await horario.save((err, horarioUpdate) => {
                    if (err) {
                      logger(chalk.red("Error al guardar"));
                      res.json({
                        msg: "error al guardar al doctor actualizado :" + err,
                      });
                    } else {
                      res.json({ msg: "Horario actualizado! " });
                    }
                  });
                } else {
                  res.json({
                    msg:
                      "El horario esta siendo usado en una cita, No se puede Modificar",
                  });
                }
              } else {
                res.json({ msg: "El Horario no pertenece al doctor" });
              }
            } else {
              res.json({ msg: "Este horario ya existe, elige otro" });
            }
          }
        }).populate({
          path: "doctor",
          populate: { path: "organizacion", select: "nameOrg" },
          select: "name & lastname",
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
      loggerwin.info("usuario no autorizado");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR:") + chalk.white(err));
  }
};

//cambiar esado de citas de pendientes a : atendido o a no atendido
exports.Cambiar_estado_citas = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await Cita.findOne({ _id: req.body.id_cita }, (err, cita) => {
          if (!cita) {
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
    loggerwin.info(err);
    logger(chalk.red("ERROR") + chalk.white(err));

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
          if (!citas) {
            logger(chalk.red("CITA NO ENCONTRADA"));
            res.json({ msg: "no encontro las cita" });
          } else {
            logger(
              chalk.blue("CITA ENCONTRADA: ") + chalk.magenta(citas.length)
            );
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
    loggerwin.info(err);
    logger(chalk.red("ERROR: ") + chalk.white(err));
  }
};
exports.Obtener_Citas_Atendidas_Doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("obtener Citas :  ") + chalk.green(req.user.id));
        await Cita.find({ doctor: req.user.id, estado: 'atendido' }, (err, citas) => {
          if (!citas) {
            logger(chalk.red("CITAs atendidas NO ENCONTRADA"));
            res.json({ msg: "No cuenta con citas atendidas" });
          } else {
            logger(
              chalk.blue("CITAS ATENDIDAS ENCONTRADAS: ") + chalk.magenta(citas.length)
            );
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
    loggerwin.info(err);
    logger(chalk.red("ERROR: ") + chalk.white(err));
  }
};

//obtener detalles de la cita de un paciente por parte del doctor de
exports.Obtener_Detalles_De_Cita_De_Un_Paciente = async function (req, res) {
  try {
    await Cita.findById(req.params.id, (err, cita) => {
      if (!cita) {
        res.json({ msg: "No se encontro la cita" });
      } else {
        logger("cita: " + cita._id);
        res.json(cita);
      }
    })
      .populate("user")
      .populate("doctor");
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR: ") + chalk.white(err));
  }
};

//el obtendra los datos de la cita para colocarlas por defecto a la receta
exports.Enviar_Datos_Nueva_Receta = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //Encontrando al docotor que esta haciendo la cita
        await Doctor.findById(req.user.id, async (err, doctor) => {
          try {
            if (!doctor) {
              logger(
                chalk.red("ERR ") + chalk.white("no se encontro el doctor")
              );
            } else {
              //mensaje encontrando al doctor
              logger(
                chalk.blue("mensaje: ") +
                  chalk.green("se encontro al doctor: ") +
                  chalk.magenta(doctor.lastname)
              );
              //encontrando cita por ID mandado por Body
              await Cita.findById(req.body.id_cita, async (err, cita) => {
                try {
                  if (!cita) {
                    logger(
                      chalk.red("ERR ") + chalk.white("no se encontro la cita")
                    );
                    logger(chalk.red("ERR ") + chalk.white(err));
                    res.send({ msg: "cita no colocada" });
                  } else {
                    await User.findById(cita.user, async (err, paciente) => {
                      try {
                        await Horario.findById(cita.horario, (err, horario) => {
                          console.log(
                            chalk.blue("nombre del paciente de la receta: ") +
                              chalk.yellow(paciente.username)
                          );
                          console.log(
                            chalk.blue("nombre del doctor de la receta: ") +
                              chalk.yellow(doctor.username)
                          );
                          res.json({
                            receta: "OK",
                            paciente: paciente.username,
                            doctor: doctor.username,
                            horario:
                              "De " +
                              horario.hora_inicio +
                              " hasta " +
                              horario.hora_fin,
                            fecha: horario.fecha,
                          });
                        });
                      } catch (error) {
                        logger(chalk.red("ERROR: ") + chalk.white(error));
                        res.send({ msg: "ERROR: " + error });
                      }
                    });
                  }
                } catch (error) {
                  logger(chalk.red("ERROR: ") + chalk.white(error));
                  res.send({ msg: "ERROR: " + error });
                }
              });
            }
          } catch (error) {
            logger(chalk.red("ERROR: ") + chalk.white(error));
            res.send({ msg: "ERROR: " + error });
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
    logger(chalk.red("ERROR: ") + chalk.white(err));
  }
};
//creacion de la receta
exports.Crear_Nueva_Receta = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await Doctor.findById(req.user.id, async (err, doctor) => {
          if (!doctor) {
            res.json({ msg: "No se encontró al doctor" });
          } else {
            await Cita.findById(req.body.id_cita, async (err, cita) => {
              if (!cita) {
                res.json({ msg: "No se encontró la cita" });
              } else {
                await Receta.findOne(
                  { cita: cita._id },
                  async (err, receta) => {
                    if (!receta) {
                      await User.findById(cita.user, async (err, paciente) => {
                        if (err) {
                          res.json({
                            msg: "No se encontró al paciente de la cita",
                          });
                        } else {
                          try {
                            /*----CARGANDO LA IMAGEN EN CLOUDINARY Y ELIMINANDOLA AUTOMATICAMENTE DE NUESTRO ARCHIVO ESTATICO ----*/
                            const uploader = async (path) =>
                            await cloudinary.uploads(path, "Firmas");
                            //console.log(req.file);
                            const file = req.file;
                            /**--------------------------------------------- */
                            if(file){
                              const path = file.path;
                            const newUrl = await uploader(path);
                            const firma_imagen = newUrl.url;
                            fs.unlinkSync(path);

                            
                              var newreceta = new Receta({
                              nombres_apellidos:
                              paciente.name + " " + paciente.lastname,
                              acto_medico: req.body.acto_medico,
                              medicamentos: req.body.medicamentos,
                              fecha_expedicion: req.body.fecha_expedicion,
                              valida_hasta: req.body.valida_hasta,
                              cita: req.body.cita,
                              firma: firma_imagen,
                            });

                            newreceta.cita = cita;
                            await newreceta.save();

                            cita.receta = newreceta;
                            await cita.save();

                            res.json({ msg: "Nueva receta guardada" });
                            }else{
                              res.json({msg:"No se detectó ninguna imagen"});
                            }
                            
                           
                            /*logger(
                              chalk.green("url de imagen cargada: ") +
                                newUrl.url
                            );
                              */
                            
                            /*------------------V-----------*/
                            
                          } catch (err) {
                            res.json(err);
                          }
                        }
                      });
                    } else {
                      res.json({ msg: "Ya existe una receta para esta cita." });
                    }
                  }
                );
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
    logger(chalk.red("ERROR: ") + chalk.white(err));
    res.send({ msg: "ERROR: " + err });
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

/*---------------para la prueba-------------------*/
exports.listar = async function (req, res) {
  try {
    await Doctor.find((err, doctores) => {
      res.json(doctores);
    });
  } catch (error) {
    console.log(chalk.red("Error: " + error));
  }
};

exports.probandoMeterMedicamentos = function (req, res) {
  logger(req.body.medicamento);
  const receta = new Receta({
    nombres_apellidos: paciente.name + paciente.lastname,
    acto_medico: req.body.acto_medico,
    medicamentos: req.body.medicamentos,
    fecha_expedicion: req.body.fecha_expedicion,
    valida_hasta: req.body.valida_hasta,
    cita: req.body.cita,
  });
  receta.save();
  logger(
    "receta: \n" +
      "medicamento 1 " +
      receta.medicamentos[0].medicamento +
      "\nmedicamento 2 " +
      receta.medicamentos[1].medicamento
  );
  res.json(receta);
};
