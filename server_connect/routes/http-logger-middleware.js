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
        serializers: {
            req: function(req) {
                return {
                    method: req.method,
                    url: req.url,
                    headers: {...req.headers },
                    remoteAddress: req.remoteAddress,
                    remotePort: req.remotePort
                };
            },
        }
    });

    app.use((req, res, next) => {
        const copiedReq = {...req, headers: {...req.headers } };
        httpLogger(copiedReq, res);
        next();
    });
};