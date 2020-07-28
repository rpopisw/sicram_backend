var passport = require('passport');
require('../../config/userpassport')(passport);
var express = require('express');
var router = express.Router();
var userController = require("../../controller/usersCrontroller");
var especialidadController = require("../../controller/especialidadController");
var dependienteCotroller = require('../../controller/dependienteController');
var citaController = require('../../controller/citaController');
const { Router } = require('express');
const { route } = require('./indexdct');


router.get('/',function (req,res) {
  res.send("a ver."); 
});

//ENDPOINT DEL PACIENTE----------------------------
//crera un nuevo usuario REGISTANDOTE
router.post('/signupuser',userController.SignupUsuario);
//LOGEARTE una vez ya tengas tu CUENTA REGISTRADA
router.post('/signinuser', userController.SingninUsuario);
//Salir de tu cuenta
router.get('/signoutuser', passport.authenticate('user', { session: false}), userController.SignoutUsuario);
//obtener datos del usuario logeado
router.get('/user/perfil/:id',passport.authenticate('user', { session: false}),userController.Obntener_datos_Paciente);
//actualizar los datos del usuario logeado
router.post('/user/perfil/update/:id',passport.authenticate('user', { session: false}),userController.Actualizar_datos_Paciente);


//ENDPOINT PARA CITA-----------------------------------
//crear nueva cita una vez logeado
router.post('/user/cita/crear/:id',passport.authenticate('user' , { session: false}),citaController.GenerarNuevaCita);
//listar citas del usuario
router.get('/user/cita/listar/:id',passport.authenticate('user', { session: false}),citaController.Obtener_Citas_Paciente);


//ENDPOINT PARA DEPENDIENTE-------------------------------
//agregar nuevo dependite
router.post('/user/dependiente/agregar/:id',passport.authenticate('user', { session: false}),dependienteCotroller.Agregar_Dependiente);
//listar dependientes
router.get('/user/dependiente/listar/:id',passport.authenticate('user', { session: false}),dependienteCotroller.Obtener_Dependientes);
//ENDPOINT PARA CITA DE DEPENDIENTE




//ENDPOINTS PARA ESPECIALIDAD---------------------------------
//cargar las primeras especialidades a la base de datos
router.get('/cargarespecialidad',especialidadController.Cargar_Especialidades);
//obtener las especialidades
router.get('/especialidad',especialidadController.Obtener_Especialidades);
//obtener especialidades por doctor
router.get('/especialidad/doctores',especialidadController.Obtener_Doctores_por_Especialidades);



module.exports = router;
