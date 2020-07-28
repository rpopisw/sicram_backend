var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DependienteSchema = new Schema({
    name:  {
        type: String,
        required: true,
    },
    lastname: {
            type: String,
            required: true,
    },    
    email:  {
            type: String,
            required: true,
            unique: true
    },
    dni: {
            type: Number,
            required: true,
            minlength: 8,
    },
    edad:{
            type: Number,
            required: true,
    },
    discapacidad:  {
            type: String,
            required: true,
    },
    celular: {
            type: Number,
            required: true,
    },
    direccion:{
            type: String,
            required: true,
    },
    cita:[{
        type: Schema.Types.ObjectId,
        ref:'Cita'
    }],
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
});

module.exports = mongoose.model('Dependiente',DependienteSchema);