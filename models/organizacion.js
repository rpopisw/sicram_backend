var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var OrganizacionSchema = new Schema({
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

module.exports = mongoose.model('Organizacion', OrganizacionSchema);
