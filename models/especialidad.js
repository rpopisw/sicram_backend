var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EspecialidadSchema = new Schema({
    especialidad:{
        type: String,
        required: true
    },
    doctor:[{
        type: Schema.Types.ObjectId,
        ref: 'Doctor' 
    }],

});


module.exports = mongoose.model('Especialidad',EspecialidadSchema);