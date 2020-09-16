var User = require("../models/user");
var Dependiente = require("../models/dependiente");
var Doctor = require("../models/doctor");
var Cita = require("../models/cita");
var Horario = require("../models/horario");
var Especialidad = require("../models/especialidad");
const loggerwin = require("../utils/logger_winston.js");
const chalk = require("chalk");
const logger = console.log;

exports.Agregar_Dependiente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("USUARIO:   ") + chalk.green(req.user.id));
        //encontramos al usuario
        var user = await User.findById(req.params.id);
        //nuevo dependiente
        var newDependiente = new Dependiente({
          name: req.body.name,
          lastname: req.body.lastname,
          email: req.body.email,
          genero: req.body.genero,
          dni: req.body.dni,
          edad: req.body.edad,
          discapacidad: req.body.discapacidad,
          celular: req.body.celular,
          direccion: req.body.direccion,
        });
        //agregamos el usuario encontrado en el dependiente
        newDependiente.user = user;
        //save del nuevo dependiente
        await newDependiente.save(async (erro, dependiente) => {
          if (erro) {
            res.json({
              msg: "error al guardar al dependiente correo ya usado:",
            });
          } else {
            logger(
              chalk.blue("se guardo dependiente: ") + chalk.green(dependiente)
            );
            //pusheamos el nuevo dependiente al paciente
            user.dependiente.push(dependiente);
            //guardamos user actualizado
            await user.save((err, user) => {
              if (err) {
                res.json({ msg: "error al guardar al usuario :" });
                throw err;
              } else {
                res.status(200).json({ msg: "nuevo dependiente guardado" });
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
    logger(chalk.red("ERROR  ") + chalk.white(err));
  }
};

exports.Modificar_Dependiente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //ENCONTRAMOS AL USUARIO
        // BUSCAMOS AL DEPENDIENTE POR ID QUE NOS LLEGARÁ POR BODY
        await Dependiente.findById(
          req.body.id_dependiente,
          async (err, dependiente) => {
            if (err) {
              res.json({
                "Error:": err,
              });
            } else {
              //dependiente.name=req.body.name;
              //dependiente.lastname=req.body.lastname;
              dependiente.email = req.body.email;
              dependiente.edad = req.body.edad;
              dependiente.discapacidad = req.body.discapacidad;
              dependiente.celular = req.body.celular;
              dependiente.direccion = req.body.direccion;

              await dependiente.save((err, dependienteUpdate) => {
                if (err) {
                  console.log("Eror", err);
                } else {
                  res.json({ msg: "Familiar actualizado." });
                }
              });

              //console.log("Datos del dependiente", dependiente);
              /*res.json({
                success: true,
                id: dependiente._id,
                nombre: dependiente.name,
                token: "Bearer " + token,
              });*/
            }
          }
        );
      }
    } else {
      return res.status(403).send({ success: false, msg: "  QUE FUE MANO" });
    }
  } catch (err) {
    console.log("Error" + err);
  }
};

exports.Obtener_Dependientes = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(
          chalk.blue("Obtener dependiente :  ") + chalk.green(req.user.id)
        );
        await Dependiente.find({ user: req.user.id }, (err, dependientes) => {
          if (!dependientes) {
            res.json({ msg: "No se encontro los dependientes" });
          } else {
            res.status(200).json(dependientes);
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
      loggerwin.info("Sin autorizacion");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    console.log("ERROR  " + err);
  }
};

exports.Agregar_Cita_Dependiente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      await Dependiente.findOne(
        { _id: req.params.id },
        async (err, dependiente) => {
          if (!dependiente) {
            res.json({ msg: "No se encontró los dependientes" });
          } else {
            logger(chalk.blue("Obteniendo del body: ") + chalk.green(req.body));
            //creando nueva cita
            var nuevacita = new Cita();
            //encontrando al usuario por parametro
            var paciente = await User.findById(req.user.id); //deberia ser metido por parametro
            logger(
              chalk.blue("User paciente: ") + chalk.green(paciente.username)
            );
            //econtrando al doctor por parametro
            var doctor = await Doctor.findById(req.body._iddoctor);
            logger(chalk.blue("User doctor: ") + chalk.green(doctor.username));
            //encontrando especialidad
            var especialidad = await Especialidad.findOne({
              especialidad: req.body.especialidad,
            });
            //si especialidad es true
            if (especialidad) {
              logger(
                chalk.blue(
                  especialidad._id + "  COMPARA  " + doctor.especialidad
                )
              );
              //si especialidad es la del doctor
              if (doctor.especialidad.equals(especialidad._id)) {
                var horario = await Horario.findOne({
                  fecha: req.body.fecha,
                  hora_inicio: req.body.hora_inicio,
                  hora_fin: req.body.hora_fin,
                  doctor: doctor,
                });
                //si horario es true
                if (horario) {
                  if (horario.cita) {
                    logger(chalk.red("Horario en uso"));
                    res.json({
                      msg: "HORARIO YA ESTA USADO ",
                      cita: horario.cita,
                    });
                  } else {
                    logger(chalk.blue("HORARIO: ") + chalk.green(horario));
                    //horario estara ocupado
                    horario.ocupado = true;
                    //agregando el doctor y el usuario a la nueva cita
                    nuevacita.user = paciente;
                    nuevacita.doctor = doctor;
                    nuevacita.especialidad = especialidad;
                    nuevacita.horario = horario;
                    //guardamos nueva cita con su doctor y su usuario respectivo
                    await nuevacita.save(function (err) {
                      if (err) {
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
                  }
                } else {
                  logger(chalk.red("HORARIO NO COINCIDE "));
                  res.json({ msg: "HORARIO NO COINCIDE" });
                }
              } else {
                logger(chalk.red("ESPECIALIDAD NO COINCIDE "));
                res.json({ msg: "La especialidad del doctor no coincide" });
              }
            } else {
              logger(chalk.red("ESPECIALIDAD NO ENCONTRADA "));
              res.status(400).json({ msg: "especialidad no encontrada" });
            }
          }
        }
      );
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR  ") + chalk.white(err));
  }
};

exports.Obtener_citas_dependiente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      var dependiente = await Dependiente.findById(req.params.id).populate(
        "cita"
      );
      res.json(dependiente.cita);
    } else {
      loggerwin.info("Sin autorizacion");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR  ") + chalk.white(err));
  }
};
exports.Eliminar_Dependiente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await User.findById(req.user.id, async (err, paciente) => {
          if (!paciente) {
            res.json({ msg: "No se encontro al paciente" });
          } else {
            await Dependiente.findById(
              req.body.id_dependiente,
              async (err, dependiente) => {
                if (!dependiente) {
                  res.json({ msg: "No se encontro dependiente" });
                } else {
                  if (dependiente.cita.length>0) {
                    res.json({
                      msg: "No puede eliminar un dependiente con citas",
                    });
                  } else {
                    logger("dependiente: " + dependiente);
                    const nombre_dependiente = dependiente.name;
                    console.log(
                      "familiares del paciente: " + nombre_dependiente
                    );
                    const depen_de_paciente = paciente.dependiente;
                    console.log(
                      "familiares del paciente: " + depen_de_paciente
                    );
                    const index_dependiente_de_paciente = depen_de_paciente.indexOf(
                      dependiente.id
                    );
                    console.log("INDICE: " + index_dependiente_de_paciente);
                    if (index_dependiente_de_paciente == -1) {
                      res.json({ msg: "Este dependiente no existe" });
                    } else {
                      depen_de_paciente.splice(
                        index_dependiente_de_paciente,
                        1
                      );
                      dependiente.deleteOne();
                      paciente.save();
                      res.json({
                        msg: "Se elimino al familiar: " + nombre_dependiente,
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
          "NO ES EL USUARIO   " +
            req.user.id +
            " comparando con " +
            req.params.id
        );
      }
    } else {
      loggerwin.warn("Sin autorizacion");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.error(err);
    console.log("ERROR  " + err);
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
