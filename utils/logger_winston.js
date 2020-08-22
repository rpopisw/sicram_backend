const winston = require('winston');

module.exports = winston.createLogger({

    format: winston.format.json(),
    transports: [
        new winston.transports.File({  
            maxsize:5120000,
            maxFiles:10,
            filename:`${__dirname}/../logs/logs.log`,

        }),
        new winston.transports.Console({
            level: `debug`
        })
    ]

});