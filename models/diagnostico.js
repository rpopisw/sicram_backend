var mongoose=require('mongoose');
var Schema= mongoose.Schema;

var DiagnosticoSchema= new Schema({
    dni:{
        type: Number,
    },
    nombres_apellidos:{
        type:String
    },
    genero:{
        type: String
    },
    fecha:{
        type: String
    },
    edad: {
        type: Number
    },
    diagnostico:{
        type: String,
    },
    resultados_labo:{
        type: String,
    },
    tratamiento:{
        type: String
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cita:{
        type: Schema.Types.ObjectId,
        ref: 'Cita'
    }
})





module.exports = mongoose.model('Diagnostico',DiagnosticoSchema);