var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecetaSchema = new Schema({
   
    dni:{
        type:String,
    },
    nombres_apellidos:{
        type:String
    },
    acto_medico:{
        type:String
    },
    medicamentos:[{
        medicamento:{
            type: String,
        },
        concentracion:{
            type: String,
        },  
        dosis_frecuencia:{
            type: String,
        },
        duracion:{
            type: String,
        },
        cantidad:{
            type: String,
        }
    }],
    fecha_expedicion:{
        type: String,
    },
    valida_hasta:{
        type: String,
    },
    cita:{
        type: Schema.Types.ObjectId,
        ref: 'Cita'
    },
    firma:{
        type:String
    }
});

module.exports = mongoose.model('Receta',RecetaSchema);