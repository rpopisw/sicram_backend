var passport = require("passport");
var config = require("../database/key");
require("../config/userpassport")(passport);
var jwt = require("jsonwebtoken");
var Organizacion = require("../models/organizacion");
var pup = require("../tools/scrapers");
var Doctor = require("../models/doctor")
var Especialidad = require("../models/especialidad")

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
            });
            await newOrg.save(function (error, newOrga) {
              if (error) {
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
    logger(chalk.red("ERRROR: ")  + chalk.white(err));
  }
};

//AGREGAR DOCTOR EN ORGANIZACION
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
    logger(chalk.red("ERR  ") + chalk.white(e));
  }
}

exports.Asignar_Horario_Medicos = async function (req, res) {
  try {
    console.log(req.headers)
    var token = getToken(req.headers);
      if (token) {
        //TODO

      } else {
        return res.status(403).send({ success: false, msg: "Unauthorized." });
      }
    
  }catch (e) {
    logger(chalk.red("ERR  ") + chalk.white(e));
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