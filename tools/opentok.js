var Opentok = require('opentok')
const apikey = '46889764';
const secreto = '40fa322b7dbb723ce9687c9f3ac1544ef14d4c7b';
ServicioOpentok = new Opentok(apikey, secreto);


//metodo parra crear id de la session
ServicioOpentok.createSession(function(err, session) {
    if (err) return console.log(err); 
    // save the sessionId
    //db.save('session', session.sessionId, done);
    return session
});
//metodo para crear el token de la session
module.exports = ServicioOpentok;
