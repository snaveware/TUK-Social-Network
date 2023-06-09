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

      let user = await prisma.user.findFirst({
        where: {
          email: { equals: validated.email },
        },
        select: {
          id: true,
          email: true,
        },
      });

      /**
       * First determine if user is student or staff. The set role
       */

      const role = "staff";

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: validated.email,
            role: {
              connect: {
                name: role,
              },
            },
          },
        });
      }

      console.log("send email user: ", user);

      const code = uuid().substring(0, 6).toUpperCase();

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

      const verificationToken = jwt.sign(
        {
          userId: user.id,
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
          studentProfileIfIsStudent: true,
          staffProfileIfIsStaff: true,
          preferences: true,
        },
      });

      console.log("Two Step user: ", user);

      if (!user) {
        RequestHandler.throwError(
          400,
          "Email is invalid",
          "User with email was not found",
          "LOGIN"
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

      if (user.status.toLowerCase() == "inactive") {
        const verificationToken = jwt.sign(
          {
            userId: user.id,
            type: "VERIFICATION",
            codeVerified: true,
            role: user.roleName,
          },
          Config.SECRET,
          { expiresIn: Config.VERIFICATION_TOKEN_LIFETIME * 2 }
        );
        RequestHandler.sendSuccess(
          req,
          res,
          {
            verificationToken,
            message:
              "Account Has been created and verified successfully, Now go ahead and tell us more about you",
          },

          206
        );
        return;
      }

      if (user.status.toLowerCase() == "locked") {
        RequestHandler.throwError(
          403,
          "Your Account is locked",
          null,
          "CONTACT_SUPPORT"
        )();
      }

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

  static async studentSetup(req, res) {
    Logger.info("Student Setup initiated");
    try {
      const validated = await AuthValidator.validateStudentSetup(req.body);

      console.log("-------Student Setup validated: ", validated);

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

      if (!tokenExtractions.codeVerified) {
        Logger.warn(
          `Attempt to setup account for user with id ${tokenExtractions.userId} using unverified token `
        );
        RequestHandler.throwError(400, "Invalid Token")();
      }

      let user = await prisma.user.findUnique({
        where: {
          id: tokenExtractions.userId,
        },
        include: {
          role: true,
          studentProfileIfIsStudent: true,

          preferences: true,
        },
      });

      console.log("Two Step user: ", user);

      if (!user) {
        RequestHandler.throwError(
          400,
          "Email is invalid",
          "User with email was not found",
          "SEND_EMAIL_CODE"
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

      if (user.roleName != "student") {
        RequestHandler.throwError(
          403,
          "Your Account is not registered as a student",
          null,
          "CONTACT_SUPPORT"
        )();
      }

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

      const programme = await prisma.programme.findUnique({
        where: {
          id: validated.programmeId,
        },
      });

      if (!programme) {
        RequestHandler.throwError(
          400,
          "The programme could not be found",
          null,
          "CONTACT_SUPPORT"
        )();
      }

      let studentClass = await prisma.class.findFirst({
        where: {
          programmeId: validated.programmeId,
          year: validated.year,
        },
      });

      if (!studentClass) {
        studentClass = await prisma.class.create({
          data: {
            year: validated.year,
            programme: {
              connect: {
                id: programme.id,
              },
            },
            chat: {
              create: {
                name: `${programme.abbreviation} ${validated.year}`,
                chatType: "class",
                description: `Group chat for ${programme.abbreviation} Class of ${validated.year}`,
                admin: {
                  connect: {
                    id: user.id,
                  },
                },
              },
            },
          },
        });
      }

      console.log("student class: ", studentClass);

      const studentProfile = await prisma.studentProfile.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          registrationNumber: validated.registrationNumber,
          class: {
            connect: {
              id: studentClass.id,
            },
          },
        },
      });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: "active",
          OTPCode: null,
          firstName: validated.firstName,
          lastName: validated.lastName,
          studentProfileIfIsStudent: {
            connect: {
              userId: studentProfile.userId,
            },
          },
        },
        include: {
          role: true,
          studentProfileIfIsStudent: true,

          preferences: true,
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

  static async staffSetup(req, res) {
    Logger.info("Staff Setup initiated");
    try {
      const validated = await AuthValidator.validateStaffSetup(req.body);

      console.log("-------Staff Setup validated: ", validated);

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

      if (!tokenExtractions.codeVerified) {
        Logger.warn(
          `Attempt to setup account for user(staff) with id ${tokenExtractions.userId} using unverified token `
        );
        RequestHandler.throwError(400, "Invalid Token")();
      }

      let user = await prisma.user.findUnique({
        where: {
          id: tokenExtractions.userId,
        },
        include: {
          role: true,
          staffProfileIfIsStaff: true,
          preferences: true,
        },
      });

      console.log("Two Step user: ", user);

      if (!user) {
        RequestHandler.throwError(
          400,
          "Email is invalid",
          "User with email was not found",
          "SEND_EMAIL_CODE"
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

      if (user.roleName != "staff") {
        RequestHandler.throwError(
          403,
          "Your Account is not registered as a staff",
          null,
          "CONTACT_SUPPORT"
        )();
      }

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

      const school = await prisma.school.findUnique({
        where: {
          id: validated.schoolId,
        },
      });

      if (!school) {
        RequestHandler.throwError(
          400,
          "The school could not be found",
          null,
          "CONTACT_SUPPORT"
        )();
      }

      const staffProfile = await prisma.staffProfile.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          staffRegistrationNumber: validated.employeeId,
          title: validated.title,
          position: validated.position,
          school: {
            connect: {
              id: validated.schoolId,
            },
          },
        },
      });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: "active",
          OTPCode: null,
          firstName: validated.firstName,
          lastName: validated.lastName,
          staffProfileIfIsStaff: {
            connect: {
              userId: staffProfile.userId,
            },
          },
        },
        include: {
          role: true,
          studentProfileIfIsStudent: true,
          staffProfileIfIsStaff: true,
          preferences: true,
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
};
