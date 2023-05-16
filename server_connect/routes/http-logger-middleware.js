const pinoHttp = require('pino-http');
const { logger: pinoLogger } = require('../modules/advanced-logger');

exports.handler = function(app) {
    const httpLogger = pinoHttp({
        logger: pinoLogger,
        customLogLevel: function(res, err) {
            if (res.statusCode >= 400) {
                return 'error';
            }
            return 'debug';
        },
    });

    app.use((req, res, next) => {
        httpLogger(req, res);
        next();
    });
};