var passport = require('passport');
require('../../config/userpassport')(passport);
var express = require('express');
var router = express.Router();
var userController = require("../../controller/usersCrontroller");
var especialidadController = require("../../controller/especialidadController");
var dependienteCotroller = require('../../controller/dependienteController');
var citaController = require('../../controller/citaController');

const upload = require('../../libs/storage')


router.get('/',function (req,res) {
  res.render("index",{title:"SICRAM"}); 
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
//listar recetas de una cita
router.get('/user/perfil/:id',passport.authenticate('user', { session: false}),userController.Obntener_datos_Paciente);

//ENDPOINT PARA CITA-----------------------------------
//crear nueva cita una vez logeado
router.post('/user/cita/crear/:id',passport.authenticate('user' , { session: false}),citaController.GenerarNuevaCita);
//listar citas pendientes del usuario
router.get('/user/cita/listar/:id',passport.authenticate('user', { session: false}),citaController.Obtener_Citas_Paciente);

//listar citas ocupadas del usuario
router.get('/user/cita/listar_ocupadas/:id',passport.authenticate('user', { session: false}),citaController.Obtener_Citas_Atendidas_Paciente);

//elimar citas
router.post('/user/cita/eliminar/:id',passport.authenticate('user', { session: false}),citaController.Eliminar_cita);
//actualizar citas
router.post('/user/cita/actualizar/:id',passport.authenticate('user', { session: false}),citaController.Actualizar_Citas);

router.post('/user/cita/eliminar_prueba',citaController.Eliminar_cita_prueba);

//Listar receta de una cita
router.post('/user/cita/ver_receta/:id',passport.authenticate('user', { session: false}),citaController.Ver_receta_paciente);

// Agregar detalle de sintomas a una cita
router.post('/user/cita/registrar_sintomas/:id',passport.authenticate('user', { session: false}),citaController.Registrar_Sintomas);

//Ver mi diagnostico de una cita
router.post('/user/cita/ver_diagnostico/:id',passport.authenticate('user', { session: false}),citaController.Ver_Diagnostico_Paciente);

//ENDPOINT PARA DEPENDIENTE-------------------------------
//agregar nuevo dependite
router.post('/user/dependiente/agregar/:id',passport.authenticate('user', { session: false}),dependienteCotroller.Agregar_Dependiente);
//Modificar dependiente
router.post('/user/dependiente/modificar/:id',passport.authenticate('user', { session: false}),dependienteCotroller.Modificar_Dependiente);
//listar dependientes
router.get('/user/dependiente/listar/:id',passport.authenticate('user', { session: false}),dependienteCotroller.Obtener_Dependientes);
//eliminar dependiente
router.post('/user/dependiente/eliminar/:id',passport.authenticate('user', { session: false}),dependienteCotroller.Eliminar_Dependiente)

//ENDPOINT PARA CITA DE DEPENDIENTE
router.post('/user/dependiente/cita/crear/:id',passport.authenticate('user', { session: false}),dependienteCotroller.Agregar_Cita_Dependiente);
// listar citas por id dependiente 
router.get('/user/dependiente/citas/:id',dependienteCotroller.Obtener_citas_dependiente);



//ENDPOINTS PARA ESPECIALIDAD---------------------------------
//cargar las primeras especialidades a la base de datos
router.post('/cargarespecialidad',especialidadController.Cargar_Especialidades);
//obtener las especialidades
router.get('/especialidad',especialidadController.Obtener_Especialidades);
//obtener especialidades por doctor
router.get('/especialidad/doctores',especialidadController.Obtener_Doctores_por_Especialidades);


//----------------pruebas
//prbando mailer
router.get('/prueba/mailer',userController.probandomailer)

//probando multer
router.post('/prueba/multer',upload.single('imagen'),userController.probandomulter)


module.exports = router;
