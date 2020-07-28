var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HorarioSchema = new Schema({
    fecha:{
        type: String,
        required: true
    },
    hora_inicio:{
        type: String,
        required: true
    },
    hora_fin:{
        type: String,
        required: true
    },
    doctor:{
        type: Schema.Types.ObjectId,
        ref: 'Doctor' 
    },
    cita:{
        type: Schema.Types.ObjectId,
        ref: 'Cita'
    }
});

module.exports = mongoose.model('Horario',HorarioSchema);