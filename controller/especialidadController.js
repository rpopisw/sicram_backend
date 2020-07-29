  var Especialidad = require('../models/especialidad');
    //-------METODOS PARA ESPECIALDIADES-------------
  //es la primera carga de las especialidades que tiene hasta ahora supuestamente la empresa
  exports.Cargar_Especialidades = function (req,res){
    const esp1 = new Especialidad({especialidad : 'Dermatologia'});
    const esp2 = new Especialidad({especialidad : 'Odontologia'});
    const esp3 = new Especialidad({especialidad : 'Alergología'});
    const esp3 = new Especialidad({especialidad : 'Audiología'});
    const esp3 = new Especialidad({especialidad : 'Cardiología'});
    const esp3 = new Especialidad({especialidad : 'Dietoterapia'});
    const esp3 = new Especialidad({especialidad : 'Endocrinología'});
    const esp3 = new Especialidad({especialidad : 'Equinoterapia'});
    const esp3 = new Especialidad({especialidad : 'Fisioterapia'});
    const esp3 = new Especialidad({especialidad : 'Gastroenterología'});
    const esp3 = new Especialidad({especialidad : 'Genética'});
    const esp3 = new Especialidad({especialidad : 'Geriatría'});
    const esp3 = new Especialidad({especialidad : 'Ginecología'});
    const esp3 = new Especialidad({especialidad : 'Quiropráctica'});
    const esp3 = new Especialidad({especialidad : 'Hematología'});
    const esp3 = new Especialidad({especialidad : 'Medicina física y rehabilitación'});
    const esp3 = new Especialidad({especialidad : 'Medicina interna'});
    const esp3 = new Especialidad({especialidad : 'Neonatología'});
    const esp3 = new Especialidad({especialidad : 'Oncología'});
    const esp3 = new Especialidad({especialidad : 'Nutriología'});
    const esp3 = new Especialidad({especialidad : 'Osteopatía'});
    const esp3 = new Especialidad({especialidad : 'Otorrinolaringología'});
    const esp3 = new Especialidad({especialidad : 'Pediatría'});
    const esp3 = new Especialidad({especialidad : 'Perinatología'});
    const esp3 = new Especialidad({especialidad : 'Psicología'});
    const esp3 = new Especialidad({especialidad : 'Psiquiatría'});
    const esp3 = new Especialidad({especialidad : 'Urologia'});
  
      esp1.save(err=>{
        if (err) throw err;
        else console.log('Expecialidad 1 cargada');
        }
        );
      esp2.save(err=>{
        if (err) throw err;
        else console.log('Expecialidad 2 cargada');
        }
        );
      esp3.save(err=>{
        if (err) throw err;
        else console.log('Expecialidad 3 cargada');
        }
        );  
      res.json({
      success: true,
      msg: 'especialidades cargadas'
      });
  }

  //obtener todas las especialidades de la empresa con sus docotores
  exports.Obtener_Especialidades = async function (req,res) {
    
    
      await Especialidad.find((err,esp)=>{
        if(err){
          console.log('eror al encontrar las especialidades');
        }else{
          res.status(200).json(esp);  
        }
      }).populate('doctor');
    
  }

  //obtner doctores por especialidad
  exports.Obtener_Doctores_por_Especialidades = async function (req,res) {
    
    await Especialidad.findOne({especialidad: req.body.especialidad},(err,esp)=>{
      if(err) console.log('especialidad no encontrada');
      else res.status(200).json(esp.doctor);
    }).populate('doctor');


    /*await Especialidad.find((err,esp)=>{
      if(err){
        console.log('eror al encontrar las especialidades');
      }else{
        res.status(200).json(esp);  
      }
    }).populate('Doctor');*/
  }
