var passport = require("passport");
var config = require("../database/key");
require("../config/userpassport")(passport);
var jwt = require("jsonwebtoken");
var User = require("../models/user");
var Cita = require("../models/cita");
const chalk = require("chalk");
const loggerwin = require("../utils/logger_winston.js");
const logger = console.log;
const mailer = require("../mail/mediador_mailer")
const Doctor = require("../models/doctor")
const Organizacion = require("../models/organizacion");

const Receta = require("../models/receta")

//multer
const upload = require("../libs/storage")


//REGISTRO USUARIO
exports.SignupUsuario = async function (req, res) {
  try {
    if (!req.body.username || !req.body.password || !req.body.email) {
      loggerwin.info("El usuario no ingreso email y contraseña");
      res.json({ success: false, msg: "Por favor, ponga email y contraseña" });
    } else {
      await User.findOne({ email: req.body.email }, async (erro, user) => {
        if (user) {
          logger(chalk.green(user.email));
          res.status(401).json({ msg: "email ya esta siendo usado" });
        } else {
          var newUser = new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            lastname: req.body.lastname,
            genero: req.body.genero,
            dni: req.body.dni,
            edad: req.body.edad,
            discapacidad: req.body.discapacidad,
            celular: req.body.celular,
            direccion: req.body.direccion,
          });
          
          mailer.notificarRegistro(`EXITO! ${newUser.name} ${newUser.lastname} \nUSTED ES UN NUEVO PACIENTE\nGRACIAS atte: SICRAM S.A.C `,newUser)
          // guardamos usuario registrado
          await newUser.save(function (err) {
            if (err) {
              loggerwin.info("Username ya existe.");
              return res.json({ success: false, msg: "Username ya existe." });
            }
            res.json({ success: true, msg: "Exito nuevo usuario creado." });
          });
        }
      });
    }
  } catch (err) {
    loggerwin.info(err);
    console.log("ERR  " + err);
  }
};
//INGRESO DE USUARIO UNA VEZ SE REGSITRO
exports.SingninUsuario = function (req, res) {
  User.findOne(
    {
      email: req.body.email,
    },
    function (err, user) {
      if (!user) {
        loggerwin.info("Autenticación de usuario fallida");
        logger(chalk.red("Autenticación de usuario fallida"));
        res.status(401).send({
          success: false,
          msg: "LA AUTENTICACION FALLO USUARIO NO EXISTE",
        });
      } else {
        // check if password matches
        logger(chalk.blue("Contraseña: " + chalk.green(user.password)));
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            // si el usuario se encuentra y la contraseña  es correcta, crea un token
            logger(chalk.blue("ID: ") + chalk.green(user.id));
            var token = jwt.sign(user.toJSON(), config.database.secretU, {
              expiresIn: 604800, // 1 week
            });
            logger(chalk.blue("ID: ") + chalk.green(user.id));
            // retornamos la informacion incluyendo el token como json
            res.json({ success: true, id: user._id, token: "Bearer " + token });
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
exports.SignoutUsuario = function (req, res) {
  req.logout();
  logger(chalk.blue("Login exitoso"));
  loggerwin.info("Sign out Exitosa.");
  res.json({ success: true, msg: "Sign out Exitosa." });
};

//obtener datos del usuario logeado, para su perfil.
exports.Obntener_datos_Paciente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        logger(chalk.blue("USUARIO:  ") + chalk.green(req.user.id));
        var user = await User.findById(req.params.id);
        res.send(user);
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

//actualizar datos de usuario logeado
exports.Actualizar_datos_Paciente = async function (req, res) {
  try {
    var token = getToken(req.headers);
    if (token) {
      if (req.user.id == req.params.id) {
        //verificar que por parametro colacaste el usuario del paciente
        await User.findById(req.user.id, async (err, paciente) => {
          if (err) {
            logger(
              chalk.blue("usuario no encontrado aqui el error: ") +
                chalk.red(err)
            );
          } else {
            logger(chalk.blue("Paciente: ") + chalk.green(paciente));
            paciente.email = req.body.email;
            paciente.discapacidad = req.body.discapacidad;
            paciente.direccion = req.body.direccion;
            paciente.edad = req.body.edad;
            paciente.celular = req.body.celular;
            await paciente.save((err, pacienteUpdate) => {
              if (err) {
                logger(
                  chalk.blue("error al guarar paciente :") + chalk.red(err)
                );
              } else {
                res.json(pacienteUpdate);
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
      loggerwin.info("Sin autorizacion");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  } catch (err) {
    loggerwin.info(err);
    logger(chalk.red("ERROR: ") + chalk.white(err));
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

//probando el mailer
exports.probandomailer = function (req, res) {
  const paciente = new User({ name:'Juan',lastname:'Merino',email: 'miguel.ramirez7@unmsm.edu.pe' });
  const doctor = new Doctor({ name: 'Cirilo',email: 'miguel.ramirez7@unmsm.edu.pe' })
  const org = new Organizacion({ email: 'miguel.ramirez7@unmsm.edu.pe' })
  console.log('email de paciente: ' + paciente.email)
  mailer.notificarRegistro(`EXITO! ${paciente.name} ${paciente.lastname} USTED ES UN NUEVO PACIENTE `,paciente)
  /*mailer.notificarActualizacionDeCita(`HOLA DOCTOR ${doctor.name} LA CITA X HA SIDO ACTUALIZADA`,doctor)
  mailer.notificarEliminacionDeCita(`HOLA DOCTOR ${doctor.name} LA CITA X HA SIDO ACTUALIZADA`,doctor)*/

  res.json({msg:'prueba'})

}

//probando multeral
exports.probandomulter = function (req, res) {
    const receta = new Receta({
      firma: req.file.path,
    })

    console.log(req.file)

    res.json(receta)
}
