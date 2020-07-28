  var Especialidad = require('../models/especialidad');
    //-------METODOS PARA ESPECIALDIADES-------------
  //es la primera carga de las especialidades que tiene hasta ahora supuestamente la empresa
  exports.Cargar_Especialidades = function (req,res){
    const esp1 = new Especialidad({especialidad : 'Dermatologia'});
    const esp2 = new Especialidad({especialidad : 'Odontologia'});
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
