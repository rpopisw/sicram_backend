const { format, createLogger, transports } = require('winston');

module.exports = createLogger({

    format: format.combine(
        format.timestamp(),
        format.simple(),
        format.timestamp()),
    transports: [
        new transports.File({  
            maxsize:5120000,
            maxFiles:10,
            filename:`${__dirname}/../logs/logs.log`,

        }),
        new transports.Console({
            level: `debug`
        })
    ]

});