var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
const mailer = require('../mail/mailer')

var OrganizacionSchema = new Schema({
  ruc:{
      type: String,
  },
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
  nameOrg:  {
        type: String,
        required: true,
  },
  direccion:{
        type: String,
        required: true,
  },
  especialidad:[{
      type: Schema.Types.ObjectId,
      ref: 'Especialidad'
  }],
  doctor:[{
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
  }]
});

OrganizacionSchema.pre('save', function (next) {
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



OrganizacionSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        console.log('entro: '+passw+' comparo con '+ this.password+' entro y ismatch' +isMatch);
        cb(null, isMatch);
    });
};

OrganizacionSchema.methods.toJSON=function(){
    let user= this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
};

OrganizacionSchema.pre('deleteOne', function (next){
    console.log('antes de eliminar organizacion eliminamos referencias')
})

OrganizacionSchema.methods.recibirMensaje =  function(msg,asunto){
    console.log("ORGANIZACION RECIBIENDO:"+msg)

    //-----------------------
    const email_options = {
        from: 'iammiguel60@gmail.com',
        to: this.email,
        subject: asunto,
        text: msg
    }
    
    mailer.sendMail(email_options,function(err){
        if(err){ return console.log(err.message)}
        console.log('Se ha enviado un mail a: '+this.email+'.')
    })
}
module.exports = mongoose.model('Organizacion', OrganizacionSchema);
