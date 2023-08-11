const RequestHandler = require("../../RequestHandler");
const Logger = require("../../Logger");
const { Config } = require("../../configs");
const AuthValidator = require("./Validator");
const { prisma } = require("../../DatabaseInit");
const jwt = require("jsonwebtoken");
const { v4: uuid, validate } = require("uuid");
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

      if (!user) {
        if (!validated.email.endsWith("tukenya.ac.ke")) {
          RequestHandler.throwError(400, "The email must be a TUK Email")();
        }

        let role = "staff";

        if (validated.email.search("student") !== -1) {
          role = "student";
        }

        user = await prisma.user.create({
          data: {
            email: validated.email,
            role: {
              connect: {
                name: role,
              },
            },
            rootFolder: {
              create: {
                name: validated.email,
                path: "",
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
        error.status = 403;
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
          rootFolder: true,
          _count: true,
          followedBy: {
            where: {
              id: tokenExtractions.userId,
            },
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
              id: true,
            },
          },
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
          403,
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
          { expiresIn: Config.VERIFICATION_TOKEN_LIFETIME * 10 }
        );
        RequestHandler.sendSuccess(
          req,
          res,
          {
            roleName: user.roleName,
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
        error.status = 403;
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
        error.status = 403;
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

      let studentWithsameRegistration = await prisma.studentProfile.findUnique({
        where: {
          registrationNumber: validated.registrationNumber,
        },
      });

      if (studentWithsameRegistration) {
        RequestHandler.throwError(
          400,
          "A student with the same registration Number is already registered"
        )();
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
          staffProfileIfIsStaff: true,
          preferences: true,
          rootFolder: true,
          _count: true,
          followedBy: {
            where: {
              id: studentProfile.userId,
            },
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
              id: true,
            },
          },
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
        error.status = 403;
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

      const staffWithSameEmployeeId = await prisma.staffProfile.findUnique({
        where: {
          staffRegistrationNumber: validated.employeeId,
        },
      });

      if (staffWithSameEmployeeId) {
        RequestHandler.throwError(
          400,
          "A staff with the same employee ID is already registered"
        )();
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
          rootFolder: true,
          _count: true,
          followedBy: {
            where: {
              id: staffProfile.userId,
            },
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
              id: true,
            },
          },
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
      console.log("staff setup Error: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getUser(req, res) {
    try {
      const userId = Number(req.params.userId) || req.auth.id;

      let user = await prisma.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          role: true,
          studentProfileIfIsStudent: true,
          staffProfileIfIsStaff: true,
          preferences: true,
          rootFolder: true,
          _count: true,
          followedBy: {
            where: {
              id: req.auth.id,
            },
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
              id: true,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, user);
    } catch (error) {
      console.log("get user Error: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async updateUser(req, res) {
    try {
      const userId = Number(req.params.userId);

      if (!userId) {
        RequestHandler.throwError(400, "userId is required")();
      }

      if (userId !== req.auth.id) {
        RequestHandler.throwError(403, "You can only edit your profile")();
      }

      const validated = await AuthValidator.validateUpdate(req.body);

      let user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          role: true,
          studentProfileIfIsStudent: true,
          staffProfileIfIsStaff: true,
          preferences: true,
          rootFolder: true,
          _count: true,
          followedBy: {
            where: {
              id: req.auth.id,
            },
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
              id: true,
            },
          },
        },
      });

      if (!user) {
        RequestHandler.throwError(404, "User not found")();
      }

      if (user.staffProfileIfIsStaff) {
        const staffProfileUpdates = {};
        if (validated.title) {
          staffProfileUpdates.title = validated.title;
        }

        if (validated.position) {
          staffProfileUpdates.position = validated.position;
        }

        if (Object.keys(staffProfileUpdates).length > 0) {
          const staffProfileUpdate = await prisma.staffProfile.update({
            where: {
              userId: userId,
            },
            data: staffProfileUpdates,
          });
        }
      }

      const userUpdates = {};

      if (validated.firstName) {
        userUpdates.firstName = validated.firstName;
      }

      if (validated.lastName) {
        userUpdates.lastName = validated.lastName;
      }

      if (validated.profileAvatarId) {
        userUpdates.profileAvatar = {
          connect: {
            id: validated.profileAvatarId,
          },
        };
      }

      if (validated.coverImageId) {
        userUpdates.coverImage = {
          connect: {
            id: validated.coverImageId,
          },
        };
      }

      if (validated.bio) {
        userUpdates.bio = validated.bio;
      }

      if (Object.keys(userUpdates).length > 0) {
        user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: userUpdates,
          include: {
            role: true,
            studentProfileIfIsStudent: true,
            staffProfileIfIsStaff: true,
            preferences: true,
            rootFolder: true,
            _count: true,
            followedBy: {
              where: {
                id: req.auth.id,
              },
              select: {
                firstName: true,
                lastName: true,
                profileAvatarId: true,
                studentProfileIfIsStudent: true,
                staffProfileIfIsStaff: true,
                id: true,
              },
            },
          },
        });
      }

      RequestHandler.sendSuccess(req, res, user);
    } catch (error) {
      console.log("follow user Error: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async followUser(req, res) {
    try {
      const userId = Number(req.params.userId);

      if (!userId) {
        RequestHandler.throwError(400, "userId is required")();
      }

      let user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          followedBy: {
            connect: {
              id: req.auth.id,
            },
          },
        },
        include: {
          role: true,
          studentProfileIfIsStudent: true,
          staffProfileIfIsStaff: true,
          preferences: true,
          rootFolder: true,
          _count: true,
          followedBy: {
            where: {
              id: req.auth.id,
            },
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
              id: true,
            },
          },
        },
      });

      if (!user) {
        RequestHandler.throwError(404, "user not found")();
      }

      await prisma.notification.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          message: `${req.auth.firstName} ${req.auth.lastName} started following you`,

          associatedUser: {
            connect: {
              id: req.auth.id,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, user);
    } catch (error) {
      console.log("follow user Error: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async unFollowUser(req, res) {
    try {
      const userId = Number(req.params.userId);

      if (!userId) {
        RequestHandler.throwError(400, "userId is required")();
      }

      let user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          followedBy: {
            disconnect: {
              id: req.auth.id,
            },
          },
        },
        include: {
          role: true,
          studentProfileIfIsStudent: true,
          staffProfileIfIsStaff: true,
          preferences: true,
          rootFolder: true,
          _count: true,
          followedBy: {
            where: {
              id: req.auth.id,
            },
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
              id: true,
            },
          },
        },
      });

      if (!user) {
        RequestHandler.throwError(404, "user not found")();
      }
      RequestHandler.sendSuccess(req, res, user);
    } catch (error) {
      console.log("follow user Error: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getNotifications(req, res) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: req.auth.id,
          isDismissed: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              staffProfileIfIsStaff: true,
              studentProfileIfIsStudent: true,
            },
          },
          associatedUser: {
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              staffProfileIfIsStaff: true,
              studentProfileIfIsStudent: true,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, notifications);
    } catch (error) {
      console.log("error getting notifications: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async dismissNotification(req, res) {
    try {
      const notificationId = Number(req.params.notificationId);

      if (!notificationId) {
        RequestHandler.throwError(400, "Notification id is required")();
      }

      const dismissedNotification = await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isDismissed: true,
        },
      });

      RequestHandler.sendSuccess(req, res, dismissedNotification);
    } catch (error) {
      console.log("error dismissing notification: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }
};
