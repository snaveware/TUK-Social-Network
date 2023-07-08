const RequestHandler = require("../../RequestHandler");
const Logger = require("../../Logger");
const { Config } = require("../../configs");
const AuthValidator = require("./Validator");
const { prisma } = require("../../DatabaseInit");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const { Mail } = require("../mail");
const { randomInt } = require("crypto");

module.exports = class AuthController {
  static async sendEmailCode(req, res) {
    Logger.info("Logging initiated");
    try {
      const validated = await AuthValidator.validateSendEmailCode(req.body);

      console.log("-------Send Email Code validated: ", validated);

      const user = await prisma.user.findFirst({
        where: {
          email: { equals: validated.email },
        },
        select: {
          id: true,
          email: true,
        },
      });

      console.log("send email user: ", user);

      const code = uuid().substring(0, 6).toUpperCase();

      if (user) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            OTPCode: code,
          },
        });

        const mailOptions = {
          to: validated.email,
          subject: "Confirmation Code",
          message: `Your Confirmation code is <b>${code}</b> Do not share with anyone`,
        };
        Mail.sendEmail(mailOptions);
      } else {
        Logger.warn(
          `Attempt to send verification code to email ${validated.email} that does note exist`
        );
      }

      const verificationToken = jwt.sign(
        {
          userId: user ? user.id : randomInt(1000),
          type: "VERIFICATION",
        },
        Config.SECRET,
        { expiresIn: Config.VERIFICATION_TOKEN_LIFETIME }
      );

      RequestHandler.sendSuccess(
        req,
        res,
        {
          verificationToken,
          expiresAt: Date.now() + Config.VERIFICATION_TOKEN_LIFETIME * 1000,
          message:
            "Verification Code has been sent if a user with the email exists",
        },
        202
      );
    } catch (error) {
      console.log("Login Error: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async login(req, res) {
    Logger.info("Logging initiated");
    try {
      const validated = await AuthValidator.validateTwoStep(req.body);

      console.log("-------TwoStep validated: ", validated);

      let tokenExtractions;

      try {
        tokenExtractions = jwt.verify(
          validated.verificationToken,
          Config.SECRET
        );
      } catch (error) {
        error.status = 401;
        error.message = "Your code has expired, Please Resend";
        error.action = "RESEND_CODE";
        throw error;
      }
      if (tokenExtractions.type !== "VERIFICATION") {
        Logger.warn(`Attempt to verify using ${tokenExtractions.type} token`);
        RequestHandler.throwError(400, "Invalid Token")();
      }

      const user = await prisma.user.findUnique({
        where: {
          id: tokenExtractions.userId,
        },
        include: {
          role: true,
          celebrityProfile: true,
          preferences: true,
          refreshTokens: true,
        },
      });

      console.log("Two Step user: ", user);

      if (!user) {
        RequestHandler.throwError(
          400,
          "Email or password is invalid",
          "User with email was not found",
          "LOGIN"
        )();
      }

      if (user.status.toLowerCase() == "pending") {
        RequestHandler.throwError(
          403,
          "Account is pending activation",
          null,
          "WAIT"
        )();
      }

      if (user.status.toLowerCase() == "locked") {
        RequestHandler.throwError(
          403,
          "Your Account is locked",
          null,
          "CONTACT_SUPPORT"
        )();
      }

      if (user.OTPCode != validated.OTPCode) {
        RequestHandler.throwError(
          401,
          "Invalid Confirmation Code",
          "OTP Code did not match",
          "CORRECT_INPUT"
        )();
      }

      delete user.password;
      delete user.refreshTokens;
      delete user.OTPCode;

      const accessToken = jwt.sign(
        {
          userId: user.id,
          type: "ACCESS",
        },
        Config.SECRET,
        { expiresIn: Config.ACCESS_TOKEN_LIFETIME }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
          type: "REFRESH",
        },
        Config.SECRET,
        { expiresIn: Config.REFRESH_TOKEN_LIFETIME }
      );

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          OTPCode: null,
          forcePasswordChange: false,
        },
      });

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
        },
      });

      res.set("Authorization", `Bearer ${accessToken}`);
      res.set("Refresh", refreshToken);

      RequestHandler.sendSuccess(req, res, {
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.log("Login Error: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async refreshToken(req, res) {
    Logger.info("refreshing token");
    try {
      let inputs = req.body;

      if (!inputs.refreshToken) {
        inputs = {
          refreshToken: req.headers.refresh,
        };
      }

      const validated = await AuthValidator.validateTokenRefresh(inputs);

      console.log("---------validated refresh token: ", validated);

      let tokenExtractions;

      try {
        tokenExtractions = jwt.verify(validated.refreshToken, Config.SECRET);
      } catch (error) {
        error.status = 401;
        error.message = "Your token  is expired, Please Login again";
        error.action = "LOGIN";
        throw error;
      }

      console.log("token extractions: ", tokenExtractions);

      if (tokenExtractions.type !== "REFRESH") {
        Logger.warn(
          `Attempt to refresh token using ${tokenExtractions.type} token`
        );
        RequestHandler.throwError(400, "Invalid Token", NULL, "LOGIN")();
      }

      const theRefreshToken = await prisma.refreshToken.findUnique({
        where: {
          token: validated.refreshToken,
        },

        include: {
          user: {
            select: {
              status: true,
              id: true,
            },
          },
        },
      });

      console.log("token to refresh: ", theRefreshToken);

      if (!theRefreshToken) {
        Logger.warn("Attempt to refresh token that does not exist");
        RequestHandler.throwError(
          404,
          "Token could not be found",
          null,
          "LOGIN"
        )();
      }

      if (!theRefreshToken.user) {
        Logger.warn(
          "Attempt to refresh token for inactive or nonexistent account"
        );
        RequestHandler.throwError(
          404,
          "User with the token is not accessible",
          null,
          "LOGIN"
        )();
      }

      const accessToken = jwt.sign(
        {
          userId: theRefreshToken.user.id,
          type: "ACCESS",
        },
        Config.SECRET,
        { expiresIn: Config.ACCESS_TOKEN_LIFETIME }
      );

      const refreshToken = jwt.sign(
        {
          userId: theRefreshToken.user.id,
          type: "REFRESH",
        },
        Config.SECRET,
        { expiresIn: Config.REFRESH_TOKEN_LIFETIME }
      );

      await prisma.refreshToken.update({
        where: {
          token: validated.refreshToken,
        },
        data: {
          token: refreshToken,
        },
      });

      res.set("Authorization", `Bearer ${accessToken}`);
      res.set("Refresh", refreshToken);

      RequestHandler.sendSuccess(req, res, { accessToken, refreshToken });
    } catch (error) {
      console.log("refresh token error: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static studentSetup(req, res) {}

  static staffSetup(req, res) {}
};
