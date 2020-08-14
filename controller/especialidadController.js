const chalk = require("chalk");
const logger = console.log;
var Especialidad = require("../models/especialidad");
//-------METODOS PARA ESPECIALDIADES-------------
//es la primera carga de las especialidades que tiene hasta ahora supuestamente la empresa
exports.Cargar_Especialidades = function (req, res) {
  const esp1 = new Especialidad({ especialidad: "Dermatologia" });
  const esp2 = new Especialidad({ especialidad: "Odontologia" });
  const esp3 = new Especialidad({ especialidad: "Alergología" });
  const esp4 = new Especialidad({ especialidad: "Audiología" });
  const esp5 = new Especialidad({ especialidad: "Cardiología" });
  const esp6 = new Especialidad({ especialidad: "Dietoterapia" });
  const esp7 = new Especialidad({ especialidad: "Endocrinología" });
  const esp8 = new Especialidad({ especialidad: "Equinoterapia" });
  const esp9 = new Especialidad({ especialidad: "Fisioterapia" });
  const esp10 = new Especialidad({ especialidad: "Gastroenterología" });
  const esp11 = new Especialidad({ especialidad: "Genética" });
  const esp12 = new Especialidad({ especialidad: "Geriatría" });
  const esp13 = new Especialidad({ especialidad: "Ginecología" });
  const esp14 = new Especialidad({ especialidad: "Quiropráctica" });
  const esp15 = new Especialidad({ especialidad: "Hematología" });
  const esp16 = new Especialidad({
    especialidad: "Medicina física y rehabilitación",
  });
  const esp17 = new Especialidad({ especialidad: "Medicina interna" });
  const esp18 = new Especialidad({ especialidad: "Neonatología" });
  const esp19 = new Especialidad({ especialidad: "Oncología" });
  const esp20 = new Especialidad({ especialidad: "Nutriología" });
  const esp21 = new Especialidad({ especialidad: "Osteopatía" });
  const esp22 = new Especialidad({ especialidad: "Otorrinolaringología" });
  const esp23 = new Especialidad({ especialidad: "Pediatría" });
  const esp24 = new Especialidad({ especialidad: "Perinatología" });
  const esp25 = new Especialidad({ especialidad: "Psicología" });
  const esp26 = new Especialidad({ especialidad: "Psiquiatría" });
  const esp27 = new Especialidad({ especialidad: "Urologia" });

  esp1.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 1 cargada");
  });
  esp2.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 2 cargada");
  });
  esp3.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp4.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp5.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp6.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp7.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp8.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp9.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp10.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp11.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp12.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp13.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp14.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp15.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp16.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp17.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp18.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp19.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp20.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp21.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp22.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp23.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp24.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });

  esp25.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });
  esp26.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });

  esp27.save((err) => {
    if (err) throw err;
    else console.log("Expecialidad 3 cargada");
  });

  res.json({
    success: true,
    msg: "especialidades cargadas",
  });
};

//obtener todas las especialidades de la empresa con sus docotores
exports.Obtener_Especialidades = async function (req, res) {
  await Especialidad.find((err, esp) => {
    if (err) {
      logger(chalk.red("eror al encontrar las especialidades"));
    } else {
      logger(
        chalk.blue("Especialidades obtenidas: ") + chalk.green(esp)
      );

      res.status(200).json(esp);
    }
  }).populate("doctor");
};

//obtner doctores por especialidad
exports.Obtener_Doctores_por_Especialidades = async function (req, res) {
  await Especialidad.findOne(
    { especialidad: req.body.especialidad },
    (err, esp) => {
      if (err) console.log("especialidad no encontrada");
      else res.status(200).json(esp.doctor);
    }
  ).populate("doctor");

  /*await Especialidad.find((err,esp)=>{
      if(err){
        console.log('eror al encontrar las especialidades');
      }else{
        res.status(200).json(esp);  
      }
    }).populate('Doctor');*/
};
