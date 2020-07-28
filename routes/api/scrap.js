var express = require('express');
//const { scrapeProduct } = require('../../tools/scrapers');
const router = express.Router();
var pup= require('../../tools/scrapers');

router.post('/buscar-cmp' , async(req, res)=>{
    /* const body = req.body;
    try{
        const cmp = await nota.create(body);
        res.status(200).json(cmp);
    }catch(error){
        return res.status(500).json({
            mensaje: 'ocurrio algo',
            error
        })
    } */
});


router.get('/nota/:id', async(req, res) => {
    
    const _id = req.params.id;
    try {
      const notaDB = await _id; 
      const respuesta = await  pup.scrapeProduct('https://200.48.13.39/cmp/php/detallexmedico.php?id='+notaDB);//scrapeProduct('https://200.48.13.39/cmp/php/detallexmedico.php?id=00'+notaDB);
      
      res.json(respuesta);
    } catch (error) {
      return res.status(400).json({
        mensaje: 'Ocurrio un error',
        error
      })
    }
  });

module.exports = router;