const Logger = require('../Logger');

const uuid4 = require('uuid4');

function createRequestId(req,res,next){

    Logger.debug('creating request id');

    const requestId = uuid4();
    req.requestId = uuid4();

    next()
}

function logRequests(req,res,next){
    Logger.debug('Logging Request');
    
    message = {
        requestId: req.requestId,
        from: req.get('X-Forwarded-For'),
        method: req.method,
        url: req.originalUrl
    }

    Logger.debug(JSON.stringify(message));

    next()
}

module.exports = {createRequestId,logRequests}
