//OBTENIENDO DATOS DEL MODEL
var User = require("../models/user");
var Cita = require("../models/cita");
var Doctor = require("../models/doctor");
var Especialidad = require("../models/especialidad");
var Horario = require("../models/horario");
var Receta = require("../models/receta");
var Diagnostico = require("../models/diagnostico");
var optk = require("../tools/opentok");
const chalk = require("chalk");
const loggerwin = require("../utils/logger_winston.js");
const logger = console.log;
const mailer = require("../mail/mediador_mailer");
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
        /*var doctor = */ await Doctor.findById(
          req.body._iddoctor,
          async (err, doctor) => {
            try {
              logger(chalk.green(doctor.username));
              //encontrando especialidad
              /*var especialidad = */
              await Especialidad.findOne(
                {
                  especialidad: req.body.especialidad,
                },
                async (err, especialidad) => {
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
                            res.json({
                              msg: "HORARIO YA ESTA USADO ",
                              cita: horario.cita,
                            });
                          } else {
                            logger(
                              chalk.blue("HORARIO: ") + chalk.green(horario)
                            );
                            //horario estara ocupado
                            horario.ocupado = true;
                            //agregando el doctor y el usuario a la nueva cita
                            nuevacita.user = paciente;
                            nuevacita.doctor = doctor;
                            nuevacita.especialidad = especialidad;
                            nuevacita.horario = horario;

                            //agregamos el token y la session a la citanueva
                            await optk.createSession(async (err, session) => {
                              try {
                                if (err) {
                                  logger(
                                    chalk.red("ERROR: ") + chalk.white(err)
                                  );
                                } else {
                                  logger(
                                    chalk.blue("sessionID: ") +
                                      chalk.magenta(session.sessionId)
                                  );
                                  var sessiontoken = optk.generateToken(
                                    session.sessionId
                                  );
                                  logger(
                                    chalk.blue("sessiontoken: ") +
                                      chalk.magenta(sessiontoken)
                                  );
                                  var aulaVirtual = {
                                    sessionId: session.sessionId,
                                    sessionToken: sessiontoken,
                                  };
                                  logger(
                                    chalk.blue("aulavirtual: ") +
                                      chalk.magenta(aulaVirtual.sessionId)
                                  );
                                  nuevacita.aulaVirtual = {
                                    sessionId: session.sessionId,
                                    sessionToken: sessiontoken,
                                  };
                                  logger(
                                    chalk.blue("aulavirtual: ") +
                                      chalk.magenta(nuevacita.aulaVirtual)
                                  );
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
                                  mailer.notificarNuevaCita(
                                    `HOLA ${doctor.name}, ${doctor.lastname} USTED TIENE UNA NUEVA CITA PROGRAMADA\n CON PACIENTE: ${paciente.name}, ${paciente.lastname}
                                  \nEN EL SIGUIENTE HORARIO:\n FECHA: ${doctor.fecha}\n HORA INICIO: ${doctor.hora_inicio}\n HORA FIN: ${doctor.hora_fin} `,
                                    doctor
                                  );
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
                                logger(
                                  chalk.red("ERROR: ") + chalk.white(error)
                                );
                                res.status(400).json({ msg: "ERROR" + error });
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
                        res.json({
                          msg: "La especialidad del doctor no coincide",
                        });
                      }
                    } else {
                      logger(chalk.red("HORARIO NO ENCONTRADA"));
                      res
                        .status(400)
                        .json({ msg: "especialidad no encontrada" });
                    }
                  } catch (error) {
                    logger(chalk.red("ERROR: ") + chalk.white(error));
                    res.status(400).json({ msg: "ERROR" + error });
                  }
                }
              );
            } catch (error) {
              logger(chalk.red("ERROR: ") + chalk.white(error));
              res.status(400).json({ msg: "ERROR" + error });
            }
          }
        );
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

//obtener nuevas citas pendientes
exports.Obtener_Citas_Paciente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("obtener Cita :  ") + chalk.green(req.user.id));
        await Cita.find(
          { user: req.user.id, estado: { $ne: "atendido" } },
          (err, citas) => {
            if (err) {
              logger(chalk.red("Cita no encontrada"));
              res.json({ msg: "no encontro las cita" });
            } else {
              res.status(200).json(citas);
            }
          }
        )
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

//obtener citas atendidas
exports.Obtener_Citas_Atendidas_Paciente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("obtener Cita :  ") + chalk.green(req.user.id));
        await Cita.find(
          { user: req.user.id, estado: "atendido" },
          (err, CitasOcupadas) => {
            if (err) {
              logger(chalk.red("Cita no encontrada"));
              res.json({ msg: "No encontro las citas" });
            } else {
              res.status(200).json(CitasOcupadas);
            }
          }
        )
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
        await Cita.findById(req.body.id_cita, async (error, cita) => {
          try {
            if (!cita) {
              res.json({ msg: "No encontramos la cita" });
            } else {
              if (cita.estado == "pendiente") {
                await User.findById(cita.user, async (err, paciente) => {
                  try {
                    if (!paciente) {
                      res.json({ msg: "No es el mismo paciente." });
                    } else {
                      await Doctor.findById(
                        cita.doctor,
                        async (err, doctor) => {
                          try {
                            if (!doctor) {
                              res.json({ msg: "Doctor de cita no encontrado" });
                            } else {
                              await Horario.findById(
                                cita.horario,
                                async (err, horario1) => {
                                  if (!horario1) {
                                    res.json({
                                      msg: "No se encontró el horario",
                                    });
                                  } else {
                                    await Doctor.findById(
                                      req.body._iddoctor,
                                      async (err, doctor2) => {
                                        try {
                                          if (!doctor2) {
                                            res.json({
                                              msg: "Nuevo doctor no encontrado",
                                            });
                                          } else {
                                            await Especialidad.findOne(
                                              {
                                                especialidad:
                                                  req.body.especialidad,
                                              },
                                              async (err, especialidad) => {
                                                if (!especialidad) {
                                                  res.json({
                                                    msg:
                                                      "Nueva especialidad no encontrada",
                                                  });
                                                } else {
                                                  if (
                                                    doctor2.especialidad.equals(
                                                      especialidad._id
                                                    )
                                                  ) {
                                                    await Horario.findOne(
                                                      {
                                                        fecha: req.body.fecha,
                                                        hora_inicio:
                                                          req.body.hora_inicio,
                                                        hora_fin:
                                                          req.body.hora_fin,
                                                        doctor: doctor2,
                                                      },
                                                      async (err, horario) => {
                                                        if (!horario) {
                                                          res.json({
                                                            msg:
                                                              "El horario introducido no existe",
                                                          });
                                                        } else {
                                                          if (
                                                            horario.ocupado ==
                                                            true
                                                          ) {
                                                            res.json({
                                                              msg:
                                                                "El horario se encuentra ocupado",
                                                            });
                                                          } else {
                                                            cita.doctor = doctor2;
                                                            cita.especialidad = especialidad;
                                                            cita.horario = horario;
                                                            await cita.save();

                                                            horario.ocupado = true;
                                                            await horario.save();

                                                            res.json({
                                                              msg:
                                                                "Cita actualizada",
                                                            });
                                                          }
                                                        }
                                                      }
                                                    );
                                                  } else {
                                                    res.json({
                                                      msg:
                                                        "El doctor no existe en la especialidad",
                                                    });
                                                  }
                                                }
                                              }
                                            );
                                          }
                                        } catch (err) {
                                          res.json(err);
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            }
                          } catch (err) {
                            res.json(err);
                          }
                        }
                      );
                    }
                  } catch (err) {
                    res.json(err);
                  }
                });
              } else {
                res.json({
                  msg: "No se puede actualizar una cita que no esté pendiente.",
                });
              }
            }
          } catch (err) {
            res.json(err);
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
          if (!cita) {
            res.json({ msg: "cita no encontrada" });
          } else {
            await User.findById(cita.user, async (err, paciente) => {
              if (!paciente) {
                res.json({ msg: "No se encuentra al paciente de la cita" });
              } else {
                await Doctor.findById(cita.doctor, async (err, doctor) => {
                  if (!doctor) {
                    res.json({ msg: "Doctor de cita no encontrado" });
                  } else {
                    await Horario.findById(
                      cita.horario,
                      async (err, horario) => {
                        if (!horario) {
                          res.json({
                            msg: "No se encuentra el horario de la cita",
                          });
                        } else {
                          //Encuentro la cita dentro del paciente y la borro
                          const index = paciente.cita.indexOf(cita._id);

                          paciente.cita.splice(index, 1);
                          await paciente.save();
                          //Encuentro la cita dentro del doctor y la borro
                          const indexdoctor = doctor.cita.indexOf(cita._id);

                          doctor.cita.splice(indexdoctor, 1);
                          await doctor.save();

                          //Ahora que las citas están borradas cambio el horario por desocupado
                          horario.ocupado = false;
                          horario.cita = null;
                          await horario.save();

                          //Ahora elimino el documento cita de la colección
                          await cita.remove();

                          res.json({ msg: "Cita eliminada" });
                        }
                      }
                    );
                  }
                });
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

exports.Ver_receta_paciente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //verificar que sea el mismo usuario del token y el de params en la ruta
        await Cita.findById(req.body.id_cita, async (err, cita) => {
          if (err) {
            res.json({ msg: "Cita no encontrada" });
          } else {
            await Receta.findById(cita.receta, async (err, receta) => {
              if (err) {
                res.json({ msg: "No se encontraron recetas para esta cita" });
              } else {
                res.json(receta);
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
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

//Ver receta por parte del médico, el médico ve la receta clickeando "Receta" dentro de su historial de citas pasadas, el paciente accede a la receta desde otra ruta
exports.Ver_receta_doctor = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //verificar que sea el mismo usuario del token y el de params en la ruta
        await Cita.findById(req.body.id_cita, async (err, cita) => {
          if (err) {
            res.json({ msg: "Cita no encontrada" });
          } else {
            await Receta.findById(cita.receta, async (err, receta) => {
              if (err) {
                res.json({ msg: "No se encontraron recetas para esta cita" });
              } else {
                res.json(receta);
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
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.Registrar_Sintomas = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await Cita.findById(req.body.id_cita, async (err, cita) => {
          if (err) {
            res.json({ msg: "No se encontró la cita" });
          } else {
            cita.detalle_sintomas.sintoma = req.body.sintoma;
            cita.detalle_sintomas.tratamiento_reciente =
              req.body.tratamiento_reciente;
            cita.detalle_sintomas.alergia = req.body.alergia;
            await cita.save();

            res.json("Sintomas agregados");
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
    res.json(err);
  }
};

exports.Registrar_Diagnostico = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        await Doctor.findById(req.user.id, async (err, doctor) => {
          if (err) {
            res.json({ msg: "No se encontró al doctor" });
          } else {
            await Cita.findById(req.body.id_cita, async (err, cita) => {
              if (err) {
                res.json({ msg: "No se encontró la cita" });
              } else {
                await Diagnostico.findOne({cita:cita._id}, async (err, diagnostico) => {
                  if (!diagnostico) {
                    await Horario.findById(
                      cita.horario,
                      async (err, horario) => {
                        if (err) {
                          res.json({
                            msg: "No se encuentra un horario para esta cita",
                          });
                        } else {
                          await User.findById(
                            cita.user,
                            async (err, paciente) => {
                              if (err) {
                                res.json({
                                  msg: "No se encontró al paciente de la cita",
                                });
                              } else {
                                try {
                                  var newdiagnostico = new Diagnostico({
                                    dni: paciente.dni,
                                    nombres_apellidos: paciente.name + " " + paciente.lastname,
                                    genero: paciente.genero,
                                    fecha: horario.fecha,
                                    nombres_medico: doctor.name+" "+doctor.lastname,
                                    edad: paciente.edad,
                                    diagnostico: req.body.diagnostico,
                                    resultados_labo: req.body.resultados_labo,
                                    tratamiento: req.body.tratamiento,
                                    anamnesis: req.body.anamnesis,
                                  });

                                  newdiagnostico.cita = cita;
                                  newdiagnostico.user = paciente;
                                  await newdiagnostico.save();
                                  //Introducimos el diagnostico a la cita
                                  cita.diagnostico = newdiagnostico;
                                  await cita.save();

                                  paciente.diagnostico.push(newdiagnostico);
                                  await paciente.save();
                                  res.json({
                                    msg: "Nuevo diagnóstico guardado",
                                  });
                                } catch (err) {
                                  res.json(err);
                                }
                              }
                            }
                          );
                        }
                      }
                    );
                  } else {
                    res.json({msg: "Ya existe un diagnóstico para esta cita"});
                  }
                });
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

exports.Ver_Diagnostico_Paciente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //verificar que sea el mismo usuario del token y el de params en la ruta
        await Cita.findById(req.body.id_cita, async (err, cita) => {
          if (err) {
            res.json({ msg: "Cita no encontrada" });
          } else {
            await Diagnostico.findById(
              cita.diagnostico,
              async (err, diagnostico) => {
                if (err) {
                  res.json({
                    msg: "No se encontró un diagnóstico para esta cita",
                  });
                } else {
                  res.json(diagnostico);
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
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

//El medico puede ver el historial de diagnosticos de un paciente en plena cita
exports.Ver_Historial_Paciente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //verificar que sea el mismo usuario del token y el de params en la ruta
        await Cita.findById(req.body.id_cita, async (err, cita) => {
          if (err) {
            res.json({ msg: "Cita no encontrada" });
          } else {
            await User.findById(cita.user, async (err, paciente) => {
              if (err) {
                res.json({ msg: "No se encontraron recetas para esta cita" });
              } else {
                await Diagnostico.find(
                  { user: paciente },
                  async (err, diagnosticos) => {
                    if (err) {
                      res.json({
                        msg:
                          "No se encontraron diagnósticos para este paciente",
                      });
                    } else {
                      res.json(diagnosticos);
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
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

//Que el médico vea el diagnostico de cada cita pasada que tenga
exports.Ver_diagnostico_doctor=async function(req,res){
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //verificar que sea el mismo usuario del token y el de params en la ruta
        await Cita.findById(req.body.id_cita, async (err, cita) => {
          if (err) {
            res.json({ msg: "Cita no encontrada" });
          } else {
            await Diagnostico.findById(cita.diagnostico, async (err, diagnostico) => {
              if (err) {
                res.json({ msg: "No se encontró el diagnóstico de esta cita" });
              } else {
                res.json(diagnostico);
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
    }
  } catch (err) {
    console.log(err);
    res.json(err);
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
