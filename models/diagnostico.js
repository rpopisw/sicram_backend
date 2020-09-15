var mongoose=require('mongoose');
var Schema= mongoose.Schema;

var DiagnosticoSchema= new Schema({
    dni:{
        type:String,
    },
    nombres_apellidos:{
        type:String
    },
    genero:{
        type: String
    },
    edad: {
        type: Number
    },
    diagnostico:{
        type: String,
    }

})





module.exports = mongoose.model('Diagnostico',DiagnosticoSchema);