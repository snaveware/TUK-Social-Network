const RequestHandler = require("../../RequestHandler");
const Logger = require("../../Logger");
const { Config } = require("../../configs");
const AuthValidator = require("./Validator");
const { prisma } = require("../../DatabaseInit");
const jwt = require("jsonwebtoken");
const { v4: uuid, validate } = require("uuid");
const { Mail } = require("../mail");
const { randomInt } = require("crypto");
const { promises } = require("dns");

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
                Access: {
                  create: {
                    isPublic: false,
                    itemType: "folder",
                  },
                },
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

      console.log("login token extractions: ", tokenExtractions);

      const user = await prisma.user.findUnique({
        where: {
          id: tokenExtractions.userId,
        },
        include: {
          role: true,
          staffProfileIfIsStaff: {
            include: {
              school: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          studentProfileIfIsStudent: {
            include: {
              class: {
                include: {
                  programme: {
                    include: {
                      school: {
                        include: {
                          faculty: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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

      console.log("Two Step (login) user: ", user);

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

      // res.set("Authorization", `Bearer ${accessToken}`);
      // res.set("Refresh", refreshToken);

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

      // res.set("Authorization", `Bearer ${accessToken}`);
      // res.set("Refresh", refreshToken);

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
                admins: {
                  connect: [
                    {
                      id: user.id,
                    },
                  ],
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

      user = await prisma.user.update({
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
          staffProfileIfIsStaff: {
            include: {
              school: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          studentProfileIfIsStudent: {
            include: {
              class: {
                include: {
                  programme: {
                    include: {
                      school: {
                        include: {
                          faculty: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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

      // res.set("Authorization", `Bearer ${accessToken}`);
      // res.set("Refresh", refreshToken);

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

      user = await prisma.user.update({
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
          staffProfileIfIsStaff: {
            include: {
              school: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          studentProfileIfIsStudent: {
            include: {
              class: {
                include: {
                  programme: {
                    include: {
                      school: {
                        include: {
                          faculty: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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

      // res.set("Authorization", `Bearer ${accessToken}`);
      // res.set("Refresh", refreshToken);

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
          staffProfileIfIsStaff: {
            include: {
              school: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          studentProfileIfIsStudent: {
            include: {
              class: {
                include: {
                  programme: {
                    include: {
                      school: {
                        include: {
                          faculty: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
          staffProfileIfIsStaff: {
            include: {
              school: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          studentProfileIfIsStudent: {
            include: {
              class: {
                include: {
                  programme: {
                    include: {
                      school: {
                        include: {
                          faculty: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
            staffProfileIfIsStaff: {
              include: {
                school: {
                  include: {
                    faculty: true,
                  },
                },
              },
            },
            studentProfileIfIsStudent: {
              include: {
                class: {
                  include: {
                    programme: {
                      include: {
                        school: {
                          include: {
                            faculty: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
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
          staffProfileIfIsStaff: {
            include: {
              school: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          studentProfileIfIsStudent: {
            include: {
              class: {
                include: {
                  programme: {
                    include: {
                      school: {
                        include: {
                          faculty: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
          staffProfileIfIsStaff: {
            include: {
              school: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          studentProfileIfIsStudent: {
            include: {
              class: {
                include: {
                  programme: {
                    include: {
                      school: {
                        include: {
                          faculty: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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

  static async search(req, res) {
    try {
      Logger.info(JSON.stringify({ action: "search", user: req.auth.id }));

      const validated = await AuthValidator.validateSearch(req.body);

      const page = validated.page || 1;

      const results = {};

      const skip = (page - 1) * Config.N0_OF_ITEMS_PER_SEARCH;

      let schoolId;
      let classId;

      const accessOptions = {};

      if (req.auth.studentProfileIfIsStudent) {
        classId = req.auth.studentProfileIfIsStudent.classId;
        schoolId = req.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (req.auth.staffProfileIfIsStaff) {
        schoolId = req.auth.staffProfileIfIsStaff.schoolId;
      }

      if (validated.items.includes("users")) {
        const options = { OR: [] };

        if (validated.searchString) {
          options.OR.push({
            firstName: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            lastName: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }

        results.users = await prisma.user.findMany({
          where: {
            role: {
              NOT: {
                name: "admin",
              },
            },

            status: "active",

            ...options,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileAvatarId: true,
            staffProfileIfIsStaff: {
              select: {
                position: true,
              },
            },
            studentProfileIfIsStudent: {
              select: {
                schoolId: true,
                registrationNumber: true,
              },
            },
          },
          take: Config.N0_OF_ITEMS_PER_SEARCH,
          skip: skip,
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (validated.items.includes("files")) {
        const options = { OR: [] };

        if (validated.searchString) {
          options.OR.push({
            name: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            path: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            owner: {
              firstName: {
                contains: validated.searchString,
                mode: "insensitive",
              },
            },
          });

          options.OR.push({
            owner: {
              lastName: {
                contains: validated.searchString,
                mode: "insensitive",
              },
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }

        results.files = await prisma.file.findMany({
          where: {
            OR: [
              {
                ownerId: req.auth.id,
              },
              {
                Access: {
                  isPublic: true,
                },
              },
              {
                Access: {
                  users: {
                    some: {
                      id: req.auth.id,
                    },
                  },
                },
              },
              {
                Access: {
                  classes: {
                    some: {
                      id: classId,
                    },
                  },
                },
              },
              {
                Access: {
                  schools: {
                    some: {
                      id: schoolId,
                    },
                  },
                },
              },
            ],
            ...options,
          },
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileAvatarId: true,
                staffProfileIfIsStaff: {
                  select: {
                    position: true,
                  },
                },
                studentProfileIfIsStudent: {
                  select: {
                    schoolId: true,
                    registrationNumber: true,
                  },
                },
              },
            },
          },
          take: Config.N0_OF_ITEMS_PER_SEARCH,
          skip: skip,
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (validated.items.includes("folders")) {
        const options = { OR: [] };

        if (validated.searchString) {
          options.OR.push({
            name: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            path: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            owner: {
              firstName: {
                contains: validated.searchString,
                mode: "insensitive",
              },
            },
          });

          options.OR.push({
            owner: {
              lastName: {
                contains: validated.searchString,
                mode: "insensitive",
              },
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }

        results.folders = await prisma.folder.findMany({
          where: {
            OR: [
              {
                ownerId: req.auth.id,
              },
              {
                Access: {
                  isPublic: true,
                },
              },
              {
                Access: {
                  users: {
                    some: {
                      id: req.auth.id,
                    },
                  },
                },
              },
              {
                Access: {
                  classes: {
                    some: {
                      id: classId,
                    },
                  },
                },
              },
              {
                Access: {
                  schools: {
                    some: {
                      id: schoolId,
                    },
                  },
                },
              },
            ],

            ownerAsRootFolder: {
              is: null,
            },

            ...options,
          },

          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileAvatarId: true,
                staffProfileIfIsStaff: {
                  select: {
                    position: true,
                  },
                },
                studentProfileIfIsStudent: {
                  select: {
                    schoolId: true,
                    registrationNumber: true,
                  },
                },
              },
            },
          },
          take: Config.N0_OF_ITEMS_PER_SEARCH,
          skip: skip,
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (validated.items.includes("posts")) {
        const options = { OR: [] };

        if (validated.searchString) {
          options.OR.push({
            caption: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });
          options.OR.push({
            owner: {
              firstName: {
                contains: validated.searchString,
                mode: "insensitive",
              },
            },
          });

          options.OR.push({
            owner: {
              lastName: {
                contains: validated.searchString,
                mode: "insensitive",
              },
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }

        results.posts = await prisma.post.findMany({
          where: {
            OR: [
              {
                ownerId: req.auth.id,
              },
              {
                Access: {
                  isPublic: true,
                },
              },
              {
                Access: {
                  users: {
                    some: {
                      id: req.auth.id,
                    },
                  },
                },
              },
              {
                Access: {
                  classes: {
                    some: {
                      id: classId || null,
                    },
                  },
                },
              },
              {
                Access: {
                  schools: {
                    some: {
                      id: schoolId,
                    },
                  },
                },
              },
            ],
            ...options,
          },

          include: {
            files: true,
            _count: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileAvatarId: true,
                studentProfileIfIsStudent: {
                  select: {
                    registrationNumber: true,
                  },
                },
                staffProfileIfIsStaff: {
                  select: {
                    title: true,
                    position: true,
                  },
                },
              },
            },
            likers: {
              where: {
                id: req.auth.id,
              },
              select: {
                id: true,
              },
            },
            Access: {
              select: {
                _count: true,
              },
            },
          },
          take: Config.N0_OF_ITEMS_PER_SEARCH,
          skip: skip,
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (validated.items.includes("programmes")) {
        const options = { OR: [] };

        if (validated.searchString) {
          options.OR.push({
            name: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            abbreviation: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }
        results.programmes = await prisma.programme.findMany({
          where: options,
          skip: skip,
          take: Config.N0_OF_ITEMS_PER_SEARCH,
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (validated.items.includes("schools")) {
        const options = { OR: [] };
        if (validated.searchString) {
          options.OR.push({
            name: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            abbreviation: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }
        results.schools = await prisma.school.findMany({
          where: options,
          skip: skip,
          take: Config.N0_OF_ITEMS_PER_SEARCH,
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (validated.items.includes("classes")) {
        const options = { OR: [] };

        if (validated.searchString) {
          options.OR.push({
            name: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            abbreviation: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }

        results.classes = await prisma.class.findMany({
          where: options,
          include: {
            programme: true,
            chat: true,
          },
          skip: skip,
          take: Config.N0_OF_ITEMS_PER_SEARCH,

          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (validated.items.includes("faculties")) {
        const options = { OR: [] };

        if (validated.searchString) {
          options.OR.push({
            name: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            abbreviation: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }

        results.faculties = await prisma.faculty.findMany({
          where: options,
          skip: skip,
          take: Config.N0_OF_ITEMS_PER_SEARCH,

          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (validated.items.includes("chats")) {
        const options = { OR: [] };

        if (validated.searchString) {
          options.OR.push({
            name: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });

          options.OR.push({
            description: {
              contains: validated.searchString,
              mode: "insensitive",
            },
          });
        }

        if (options.OR.length < 1) {
          delete options.OR;
        }

        results.chats = await prisma.chat.findMany({
          where: {
            chatType: "group",
            ...options,
          },
          skip: skip,
          take: Config.N0_OF_ITEMS_PER_SEARCH,

          orderBy: {
            createdAt: "desc",
          },
        });
      }

      RequestHandler.sendSuccess(req, res, results);
    } catch (error) {
      console.log("error searching", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async share(req, res) {
    try {
      Logger.info(JSON.stringify({ action: "share", user: req.auth.id }));

      const validated = await AuthValidator.validateShare(req.body);

      let schoolId;
      let classId;

      if (req.auth.studentProfileIfIsStudent) {
        classId = req.auth.studentProfileIfIsStudent.classId;
        schoolId = req.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (req.auth.staffProfileIfIsStaff) {
        schoolId = req.auth.staffProfileIfIsStaff.schoolId;
      }

      console.log("Validate: ", validated);

      const data = {
        chats: {
          connect: [],
        },
      };

      if (validated.users && validated.users.length > 0) {
        data.users = {
          connect: validated.users.map((id) => ({ id })),
        };

        // const userChats = await prisma.chat.findMany({
        //   where: {
        //     chatType: "private",
        //     OR: [
        //       {
        //         members: {
        //           every: {
        //             id: {
        //               in: validated.users,
        //             },
        //           },
        //         },
        //       },
        //       {
        //         members: {
        //           every: {
        //             id: req.auth.id,
        //           },
        //         },
        //       },
        //     ],
        //   },
        //   select: {
        //     id: true,
        //   },
        // });

        await Promise.all(
          validated.users.map(async (userId) => {
            let chatWithUser;
            const possibleChatsWithUser = await prisma.chat.findMany({
              where: {
                chatType: "private",
                members: {
                  some: {
                    id: req.auth.id,
                  },
                },
                members: {
                  some: {
                    id: userId,
                  },
                },
              },
              select: {
                id: true,
                members: true,
              },
            });

            console.log(
              "possible chats: ",
              possibleChatsWithUser,
              "o: ",
              possibleChatsWithUser[0]
            );

            for (let i = 0; i < possibleChatsWithUser.length; i++) {
              const element = possibleChatsWithUser[i];
              console.log("auth id: ", req.auth.id);
              console.log("element members: ", element.members);

              if (
                element.members &&
                element.members.length === 2 &&
                (element.members[0].id === userId ||
                  element.members[0].id === req.auth.id) &&
                (element.members[1].id === userId ||
                  element.members[1].id === req.auth.id)
              ) {
                chatWithUser = element;
                break;
              }
            }

            if (!chatWithUser) {
              const otherUser = await prisma.user.findUnique({
                where: {
                  id: userId,
                },
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              });

              if (!otherUser) {
                RequestHandler.throwError(404, "The user was not found")();
              }

              chatWithUser = await prisma.chat.create({
                data: {
                  name: `${req.auth.firstName} ${req.auth.lastName} and ${otherUser.firstName} ${otherUser.lastName}`,
                  description: `A chat between ${req.auth.firstName} ${req.auth.lastName} and ${otherUser.firstName} ${otherUser.lastName}`,
                  members: {
                    connect: [
                      {
                        id: req.auth.id,
                      },
                      {
                        id: userId,
                      },
                    ],
                  },
                  chatType: "private",
                },
              });
            }

            data.chats.connect.push({ id: chatWithUser.id });

            console.log("chat with user: ", chatWithUser);
          })
        );

        // console.log("urser chats: ", userChats);

        // data.chats = {
        //   connect: userChats.map((chat) => ({
        //     id: chat.id,
        //   })),
        // };
      }

      if (validated.chats && validated.chats.length > 0) {
        data.chats = {
          connect: validated.chats.map((id) => ({ id })),
        };
      }

      if (validated.schools && validated.schools.length > 0) {
        data.schools = {
          connect: validated.schools.map((id) => ({ id })),
        };
        const schoolChats = await prisma.chat.findMany({
          where: {
            schoolIfSchoolChat: {
              id: {
                in: validated.schools,
              },
            },
          },
          select: {
            id: true,
          },
        });

        data.chats = {
          connect: schoolChats.map((chat) => ({
            id: chat.id,
          })),
        };
      }

      if (validated.programmes && validated.programmes.length > 0) {
        data.programmes = {
          connect: validated.programmes.map((id) => ({ id })),
        };
      }

      if (validated.faculties && validated.faculties.length > 0) {
        data.faculties = {
          connect: validated.faculties.map((id) => ({ id })),
        };
      }

      if (validated.classes && validated.classes.length > 0) {
        // data.classes = validated.classes.map((id) => ({ id }));
        // data.chats = validated.classes.map((id) => ({ id }));

        data.classes = {
          connect: validated.classes.map((id) => ({ id })),
        };
        const classChats = await prisma.chat.findMany({
          where: {
            classIfClassChat: {
              id: {
                in: validated.classes,
              },
            },
          },
          select: {
            id: true,
          },
        });

        data.chats = {
          connect: classChats.map((chat) => ({
            id: chat.id,
          })),
        };
      }

      // console.log(
      //   "access data :",
      //   data,
      //   "chat connects: ",
      //   data.chats.connect,
      //   "user connects",
      //   data.users.connect,
      //   "classes connects: ",
      //   data.classes,
      //   "validated ",
      //   validated
      // );

      console.log("Data.chats: ", data.chats);

      if (validated.items.file) {
        const file = await prisma.file.findUnique({
          where: {
            id: validated.items.file,
          },
          select: {
            id: true,
            accessId: true,
            ownerId: true,
          },
        });

        console.log("file: ", file);

        if (!file) {
          RequestHandler.throwError(404, "File not found")();
        }

        await prisma.access.update({
          where: {
            id: file.accessId,
            OR: [
              {
                isPublic: true,
              },
              {
                fileIfItemIsFile: {
                  ownerId: req.auth.id,
                },
              },
              {
                users: {
                  some: {
                    id: req.auth.id,
                  },
                },
              },
              {
                classes: {
                  some: {
                    id: classId,
                  },
                },
              },
              {
                schools: {
                  some: {
                    id: schoolId,
                  },
                },
              },
            ],
          },
          data: data,
        });

        if (data.chats && data.chats.connect && data.chats.connect.length > 0) {
          await Promise.all(
            data.chats.connect.map(async (chatConnId) => {
              await prisma.chat.update({
                where: {
                  id: chatConnId.id,
                },
                data: {
                  messages: {
                    create: {
                      sender: {
                        connect: {
                          id: file.ownerId,
                        },
                      },
                      message: "Shared A File",
                      attachedFiles: {
                        connect: [
                          {
                            id: file.id,
                          },
                        ],
                      },
                    },
                  },
                  updatedAt: new Date(),
                },
              });
            })
          );
        }
      }

      if (validated.items.post) {
        const post = await prisma.post.findUnique({
          where: {
            id: validated.items.post,
          },
          select: {
            id: true,
            accessId: true,
            ownerId: true,
          },
        });

        console.log("post: ", post);

        if (!post) {
          RequestHandler.throwError(404, "Post not found ")();
        }

        await prisma.access.update({
          where: {
            id: post.accessId,
            OR: [
              {
                isPublic: true,
              },
              {
                postIfItemIsPost: {
                  ownerId: req.auth.id,
                },
              },
              {
                users: {
                  some: {
                    id: req.auth.id,
                  },
                },
              },
              {
                classes: {
                  some: {
                    id: classId,
                  },
                },
              },
              {
                schools: {
                  some: {
                    id: schoolId,
                  },
                },
              },
            ],
          },
          data: data,
        });

        console.log("Data: ", data.chats);

        if (data.chats && data.chats.connect && data.chats.connect.length > 0) {
          await Promise.all(
            data.chats.connect.map(async (chatConnId) => {
              await prisma.chat.update({
                where: {
                  id: chatConnId.id,
                },
                data: {
                  messages: {
                    create: {
                      sender: {
                        connect: {
                          id: post.ownerId,
                        },
                      },
                      message:
                        validated.action === "update" ? "updated post" : "",
                      linkedPost: {
                        connect: {
                          id: post.id,
                        },
                      },
                    },
                  },
                  updatedAt: new Date(),
                },
              });
            })
          );
        }
      }

      if (validated.items.folder) {
        const folder = await prisma.folder.findUnique({
          where: {
            id: validated.items.folder,
          },
          select: {
            id: true,
            accessId: true,
            ownerId: true,
          },
        });

        console.log("folder: ", folder);

        if (!folder) {
          RequestHandler.throwError(404, "Folder not found")();
        }

        await prisma.access.update({
          where: {
            id: folder.accessId,
            OR: [
              {
                isPublic: true,
              },
              {
                folderIfItemIsFolder: {
                  ownerId: req.auth.id,
                },
              },
              {
                users: {
                  some: {
                    id: req.auth.id,
                  },
                },
              },
              {
                classes: {
                  some: {
                    id: classId,
                  },
                },
              },
              {
                schools: {
                  some: {
                    id: schoolId,
                  },
                },
              },
            ],
          },
          data: data,
        });

        if (data.chats && data.chats.connect && data.chats.connect.length > 0) {
          await Promise.all(
            data.chats.connect.map(async (chatConnId) => {
              await prisma.chat.update({
                where: {
                  id: chatConnId.id,
                },
                data: {
                  messages: {
                    create: {
                      sender: {
                        connect: {
                          id: folder.ownerId,
                        },
                      },
                      message: "Shared a Folder",
                      sharedFolders: {
                        connect: [
                          {
                            id: folder.id,
                          },
                        ],
                      },
                    },
                  },
                  updatedAt: new Date(),
                },
              });
            })
          );
        }
      }

      RequestHandler.sendSuccess(req, res, { message: "updated successfully" });
    } catch (error) {
      console.log("error sharing ");
      RequestHandler.sendError(req, res, error);
    }
  }

  static async togglePublic(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "make public",
          body: req.body,
          user: req.auth.id,
        })
      );

      let message;

      const validated = await AuthValidator.validateTogglePublic(req.body);

      if (validated.type === "file") {
        const file = await prisma.file.findUnique({
          where: {
            id: validated.itemId,
            ownerId: req.auth.id,
          },
          select: {
            Access: true,
            id: true,
          },
        });

        if (!file) {
          RequestHandler.throwError(404, "file not found")();
        }

        await prisma.access.update({
          where: {
            id: file.Access.id,
          },
          data: {
            isPublic: !file.Access.isPublic,
          },
        });

        if (!file.Access.isPublic) {
          message = "The file is now public";
        } else {
          message = "Now Only allowed users will be able to access this file";
        }
      }

      if (validated.type === "folder") {
        const folder = await prisma.folder.findUnique({
          where: {
            id: validated.itemId,
            ownerId: req.auth.id,
          },
          select: {
            Access: true,
            id: true,
          },
        });

        if (!folder) {
          RequestHandler.throwError(404, "file not found")();
        }
        console.log("Updating....public");
        await prisma.access.update({
          where: {
            id: folder.Access.id,
          },
          data: {
            isPublic: folder.Access.isPublic ? false : true,
          },
        });

        if (!folder.Access.isPublic) {
          message = "The Folder is now public";
        } else {
          message = "Now Only allowed users will be able to acces this folder";
        }
      }

      if (validated.type === "post") {
        const post = await prisma.post.findUnique({
          where: {
            id: validated.itemId,
            ownerId: req.auth.id,
          },
          select: {
            Access: true,
            id: true,
          },
        });

        if (!post) {
          RequestHandler.throwError(404, "file not found")();
        }

        await prisma.access.update({
          where: {
            id: post.Access.id,
          },
          data: {
            isPublic: !post.Access.isPublic,
          },
        });

        if (!post.Access.isPublic) {
          message = "The post is now public";
        } else {
          message = "Now Only allowed users will be able to view this post";
        }
      }

      RequestHandler.sendSuccess(req, res, {
        message: message || "Public toggled successfully",
      });
    } catch (error) {
      console.log("Error making items public: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async savePost(req, res) {
    try {
      const postId = Number(req.params.postId);

      if (!postId) {
        RequestHandler.throwError(400, "POst id is required")();
      }

      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
        },
      });

      if (!post) {
        RequestHandler.throwError(404, "Post not found")();
      }

      const save = await prisma.user.update({
        where: {
          id: req.auth.id,
        },
        data: {
          savedPosts: {
            connect: [
              {
                id: post.id,
              },
            ],
          },
        },
      });

      RequestHandler.sendSuccess(req, res, save);
    } catch (error) {
      console.log("error saving post", error);

      RequestHandler.sendError(req, res, error);
    }
  }

  static async rePost(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "repost",
          user: req.auth.id,
          post: req.params.postsId,
        })
      );

      const postId = Number(req.params.postId);

      if (!postId) {
        RequestHandler.throwError(400, "POst id is required")();
      }

      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
        },
      });

      console.log("reposted post: ", post);

      if (!post) {
        RequestHandler.throwError(404, "Post not found")();
      }

      const repost = await prisma.user.update({
        where: {
          id: req.auth.id,
        },
        data: {
          repostedPosts: {
            connect: [
              {
                id: post.id,
              },
            ],
          },
        },
      });

      console.log("repost", repost);

      RequestHandler.sendSuccess(req, res, repost);
    } catch (error) {
      console.log("error saving post", error);

      RequestHandler.sendError(req, res, error);
    }
  }
};
