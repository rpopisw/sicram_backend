const { json } = require('body-parser');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CitaSchema = new Schema({
    especialidad:{
        type: Schema.Types.ObjectId,
        ref: 'Especialidad',
        required: true
    },
    horario:{
        type: Schema.Types.ObjectId,
        ref: 'Horario',
    },
    estado:{
        type: String,
        default: 'pendiente'
    },
    doctor:{
        type: Schema.Types.ObjectId,
        ref: 'Doctor' 
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receta:{
        type: Schema.Types.ObjectId,
        ref: 'Receta'
    },
    detalle_sintomas:{
        sintoma: String,
        tratamiento_reciente:{type: Boolean , default: false},
        alergia:{type: Boolean, default: false}
    },
    aulaVirtual:{
        sessionId:{
            type: String,
        },
        sessionToken:{
            type: String
        }
    }
});


module.exports = mongoose.model('Cita',CitaSchema);