var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
const dependiente = require('./dependiente');
const mailer = require('../mail/mailer')

var UserSchema = new Schema({
  username: {
        type: String,
        unique: true,
        required: true,
    },
  password: {
        type: String,
        required: true
    },
  email:  {
        type: String,
        required: true,
        unique: true
  },
  genero: {
      type:String,
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
        ref: 'Cita'
  }],
  diagnostico:[{
    type:Schema.Types.ObjectId,
    ref: 'Diagnostico'
    }],
  dependiente:[{
      type:Schema.Types.ObjectId,
      ref: 'Dependiente'
  }]
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.toJSON=function(){
    let user= this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        console.log('entro: '+passw+' comparo con '+ this.password+' entro y ismatch' +isMatch);
        cb(null, isMatch);
    });
};
//opciones para el mediador_mailer
UserSchema.methods.recibirMensaje = function(msg,asunto){
    console.log("PACIENTE "+this.email+" RECIBIENDO:"+msg)

    //-----------------------
    const email_options = {
        from: 'sicram.empresa@gmail.com',
        to: this.email,
        subject: asunto,
        text: msg
    }
    
    mailer.sendMail(email_options,function(err){
        if(err){ return console.log(err.message)}
        console.log('Se ha enviado un mail a: '+this.email+'.')
    })




}

module.exports = mongoose.model('User', UserSchema);
