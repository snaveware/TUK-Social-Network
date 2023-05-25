Logger = require("./Logger");
module.exports = class RequestHandler {
    static throwError(status, message, verbose, e = null) {
        return (e) => {
            if (e) {
                throw e;
                return;
            }
            e = new Error(message);
            e.status = status || 5000;
            e.verbose = verbose;
            throw e;
        };
    }

    static sendError(req, res, error) {
        Logger.debug("Responding with error");
        Logger.error(
            JSON.stringify({
                requestId: req.requestId,
                path: req.originalUrl,
                status: error.status || "default 500",
                message: error.verbose
                    ? `Request failed: ${error.verbose}`
                    : `Request failed: ${error.message}`,
            })
        );
        return res.status(error.status || 500).json(error.message);
    }

    static sendErrorMessage(req, res, status, message, verbose) {
        Logger.debug("Responding with error message");
        Logger.error(
            JSON.stringify({
                requestId: req.requestId,
                path: req.originalUrl,
                status: status || "default 500",
                message: verbose
                    ? `Request Failed: ${verbose}`
                    : `Request failed: ${message}`,
            })
        );
        return res.status(status || 500).json(message);
    }

    static sendSuccess(requestId, res, data, status) {
        Logger.debug("Responding with success");
        Logger.debug(
            JSON.stringify({
                requestId: requestId,
                status: status ? status : "default 200",
                message: "Request completed successfully",
            })
        );
        return res.status(status || 200).json(data);
    }
};
