var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var DoctorSchema = new Schema({
  username: {
        type: String,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    },
  email:  {
        type: String,
        required: true,
        unique:true
  },
  name:  {
        type: String,
        required: true,
  },
  lastname: {
        type: String,
        required: true,
  },    
  dni: {
        type: Number,
        required: true,
        maxlength: 8,
  },
  edad:{
        type: Number,
        required: true,
  },
  celular: {
        type: Number,
        required: true,
  },
  cmp: {
      type: Number,
      required:true,

  },
  profesion:{
    type: String,
    required: true,
  },
  horario:[{
    type: Schema.Types.ObjectId,
    ref: 'Horario'
  }],
  especialidad:{
    type: Schema.Types.ObjectId,
    ref: 'Especialidad'
  },
  organizacion:{
    type: Schema.Types.ObjectId,
    ref:  'Organizacion'
  },
  cita:[{
      type:Schema.Types.ObjectId,
      ref: 'Cita'
  }]
});

DoctorSchema.pre('save', function (next) {
    var doctor = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(doctor.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                doctor.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

DoctorSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        console.log('entro: '+passw+' comparo con '+ this.password+' entro y ismatch' +isMatch);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Doctor', DoctorSchema);