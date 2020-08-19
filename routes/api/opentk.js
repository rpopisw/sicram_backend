var express = require('express');
//const { scrapeProduct } = require('../../tools/scrapers');
const router = express.Router();
var optk= require('../../tools/opentok');
const chalk = require('chalk')
const logger = console.log;

router.get('/obtener/tokenysession' , async(req, res)=>{
    try {
        await optk.createSession((err, session)=>{
            if (err) {

            }else{
                logger(chalk.blue("sessionID: ")+ chalk.magenta(session.sessionId));
                var sessiontoken = optk.generateToken(session.sessionId);
                logger(chalk.blue("sessiontoken: ")+ chalk.magenta(sessiontoken));
                res.json({sessionID: session.sessionId,sessionToken: sessiontoken})
            }  
        });
     
    } catch (error) {
        logger(chalk.red("ERROR: ")+ chalk.white(error));
        res.send({msg:"ERROR: "+error})
    }
});

module.exports = router;
