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
    doctor:{
        type: Schema.Types.ObjectId,
        ref: 'Doctor' 
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Cita',CitaSchema);