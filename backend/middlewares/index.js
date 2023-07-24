/**
 * required modules
 * uuid4, jsonwebtoken, Logger, RequestHandler, sysConfig
 */

const { createRequestId, logRequests } = require("./utils");

const { AuthMiddleware, OptionalAuthMiddleware } = require("./auth");
const { fileUploadFunction } = require("./fileUpload");

module.exports = {
  createRequestId,
  logRequests,
  AuthMiddleware,
  OptionalAuthMiddleware,
  fileUploadFunction,
};
