var passport = require('passport');
require('../../config/userpassport')(passport);
var express = require('express');
var router = express.Router();
var doctorController = require("../../controller/doctorController");
var citaController = require('../../controller/citaController');
const { route } = require('./indexusr');

router.get('/',function (req,res) {
  res.render("index",{title:"SICRAM"}); 
});
/**---------------------------------------------------------------------------- */
//crera un nuevo usuario REGISTANDOTE
router.post('/signupdoctor', doctorController.SignupDoctor);
//LOGEARTE una vez ya tengas tu CUENTA REGISTRADA
router.post('/signindoctor', doctorController.SigninDoctor);
//salir de la cuenta del doctor
router.get('/signoutdoctor', passport.authenticate('doctor', { session: false}), doctorController.SignoutDoctor);
//mostrar datos del perfil del doctor
router.get('/doctor/perfil/:id', passport.authenticate('doctor', { session: false}), doctorController.Obtener_datos_doctor);
//actualizar datos del doctor logeado
router.post('/doctor/perfil/update/:id',passport.authenticate('doctor', { session: false}),doctorController.Actualizar_datos_doctor)


//HORARIOS DEL DOCTOR
router.post('/doctor/horario/agregar/:id',passport.authenticate('doctor', { session: false}),doctorController.Agregar_horario_doctor)
//horarios por id de doctor
router.get('/doctor/horarios/:id',doctorController.Obtener_horario_doctor)
//horarios ocupados por id del doctor
router.get('/doctor/horarios_ocupados/:id',doctorController.Obtener_horarios_ocupados_doctor)
// modificar horario del doctor
router.post('/doctor/horario/modificar/:id',passport.authenticate('doctor', { session: false}),doctorController.Actualizar_horario_doctor)
//eliminar hoario del doctor
router.post('/doctor/horario/eliminar/:id',passport.authenticate('doctor', { session: false}),doctorController.Eliminar_horario_doctor)

//CITAS DEL DOCTOR
//listar citas del doctor
router.get('/doctor/cita/listar/:id',passport.authenticate('doctor', { session: false}),doctorController.Obtener_Citas_Doctor)
//CITAS MANEJADAS POR EL DOCTOR PARA CAMBIAR DE ESTADO DE PENDIENTE A -> ATENDIDO Y A NO ATENDIDO
router.post('/doctor/cita/estado/:id',passport.authenticate('doctor', { session: false}),doctorController.Cambiar_estado_citas)

//RECETAS DOCTORS
//datos iniciales de la nueva receta
router.get('/doctor/receta/datos/:id',passport.authenticate('doctor', { session: false}),doctorController.Enviar_Datos_Nueva_Receta)
//crear nueva receta
router.post('/doctor/receta/crear/:id',passport.authenticate('doctor', { session: false}),doctorController.Crear_Nueva_Receta)
//ver receta que el medico receto a un paciente
router.get('/doctor/receta/ver_receta/:id',passport.authenticate('doctor', { session: false}),citaController.Ver_receta_doctor)



//para la prueba
router.get('/doctor/listar',doctorController.listar)

module.exports = router;
 