const cloudinary = require('cloudinary')

cloudinary.config({ 
    cloud_name: 'nodefinida', 
    api_key: '617998179123296', 
    api_secret: '4QKPyHt-4mlG3-OYA41SiSK-2T8' 
  });

  exports.uploads = (file,folder)=>{
      return new Promise((resolve, reject) =>{
          cloudinary.uploader.upload(file,(result)=>{
              resolve({
                  url: result.url,
                  id: result.public_id,
                })
          },{
              resource_type:"auto",
              folder:folder
          })
      })
  }

