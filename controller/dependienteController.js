var User = require('../models/user');
var Dependiente= require('../models/dependiente');

exports.Agregar_Dependiente = async function(req,res){
    try{
        var token = getToken(req.headers);
        if (token) {
           
           if(req.user.id==req.params.id){
                console.log('USUARIO ?   '+req.user.id); 
                //encontramos al usuario  
                var user = await User.findById(req.params.id);
                //nuevo dependiente
                var newDependiente = new Dependiente({
                    name:     req.body.name,
                    lastname: req.body.lastname,    
                    email:    req.body.email,
                    dni:      req.body.dni,
                    edad:     req.body.edad,
                    discapacidad:  req.body.discapacidad,
                    celular:    req.body.celular,
                    direccion:  req.body.direccion 
                });
                //agregamos el usuario encontrado en el dependiente
                newDependiente.user=user;
                //save del nuevo dependiente
                await  newDependiente.save((erro,dependiente)=>{
                    if (erro) {
                        res.send('error al guardar al dependiente correo ya usado:');
                    } else {
                        console.log('se guardo dependiente: '+ dependiente);
                        res.status(200).json({msg: 'nuevo dependiente guardado'});
                    }
                    });
                
                //pusheamos el nuevo dependiente al paciente
                user.dependiente.push(newDependiente);
                //guardamos dooctor actualizado
                await user.save((err,user)=>{
                    if (err) {
                        res.send('error al guardar al usuario :'+err);
                        throw err
                    }
                    });

            }else{
             res.send('NO ES EL USUARIO   ' +   req.user.id + ' comparando con ' + req.params.id)
            }
        }else{
            return res.status(403).send({success: false, msg: 'Unauthorized.'});
             }
    }catch(err){
        console.log('ERROR  '+err);
    }
}

exports.Obtener_Dependientes = async function(req,res){
    try{
        var token = getToken(req.headers);
        if (token) {
           if(req.user.id==req.params.id){
                console.log('obtener dependiente :  '+req.user.id);    
                await Dependiente.find({user:req.user.id},(err,dependientes)=>{
                    if(err){
                        res.json({msg:'no encontro las dependientes'})
                    }else{
                        res.status(200).json(dependientes);
                    }
                });

            }else{
             res.send('NO ES EL USUARIO   ' +   req.user.id + ' comparando con ' + req.params.id)
            }
        }else{
            return res.status(403).send({success: false, msg: 'Unauthorized.'});
             }
    }catch(err){
        console.log('ERROR  '+err);
    }
}

exports.Agregar_Cita_Dependiente = function(req,res){

}