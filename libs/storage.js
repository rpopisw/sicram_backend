const multer = require('multer')
const path = require('path');
const { rejects } = require('assert');
//configurando el lugar donde se almacenaran las imagenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './storage/img')
    },
    filename: function (req, file, cb) {
      cb(null, 'imagen'+'-'+Date.now()+file.originalname)
    },
    
  })

var fileFilter = function (req, file, cb) {

    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
         console.log('se guardo la imagen')
          return cb(null, true);
      }
     else{
         console.log('archivo no soportado, imagen no guardada')
         cb(null, false);
     }
      
  }
var upload = multer( {
      storage: storage,
      fileFilter : fileFilter   
    })

  module.exports = upload