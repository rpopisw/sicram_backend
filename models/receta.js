var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecetaSchema = new Schema({
    medicina:{
        type: Array,
    },
    indicaciones:{
        type: String,
    },  
    nombredoctor:{
        type: String,
    },
    nombrepaciente:{
        type: String,
    },
    horario:{
        type: String,
    },
    fecha:{
        type: String,
    },
    cita:{
        type: Schema.Types.ObjectId,
        ref: 'Cita'
    }
});

module.exports = mongoose.model('Receta',RecetaSchema);