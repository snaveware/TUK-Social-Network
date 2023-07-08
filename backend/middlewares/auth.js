const RequestHandler = require("../RequestHandler");
const Logger = require("../Logger");
const { verify } = require("jsonwebtoken");
const { Config } = require("../configs");

async function authenticate(req) {
  Logger.info("Extracting bearer token");
  let bearerToken = req.headers.authorization;

  if (!bearerToken) {
    RequestHandler.throwError(401, "You must provide an access token")();
  }

  bearerToken = bearerToken.trim();

  if (!bearerToken.startsWith("Bearer ")) {
    RequestHandler.throwError(400, "Wrong configuration of the access token")();
  }

  const token = bearerToken.split(" ").pop();

  Logger.info("Verifying access token");

  try {
    const extracted = verify(token, Config.JWT_ACCESS_SECRET);

    /**
     * TODO : GET Authenticated user using Prisma Client
     */

    if (!req.auth) {
      RequestHandler.throwError(
        401,
        "Invalid access token",
        "account not found"
      )();
    }
  } catch (error) {
    RequestHandler.throwError(401, "Invalid access token")();
  }
}

async function authMiddleware(req, res, next) {
  try {
    await authenticate(req);
    next();
  } catch (error) {
    RequestHandler.sendError(req.requestId, res, error);
  }
}

module.exports = { authMiddleware };
