const Joi = require("joi");
const Logger = require("../../Logger");
const RequestHandler = require("../../RequestHandler");

module.exports = class AuthValidator {
  static async validateSendEmailCode(values) {
    Logger.info("Validating Send Email Code");
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .label("Email")
        .email()
        .lowercase()
        .messages({
          "string.base": "Email must be a string",
          "any.required": "Email is required",
          "string.email": "Must be a valid email address",
        }),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("Send Email Code validation error: ", error);
      error.action = "CORRECT_INPUT";
      error.status = 400;
      throw error;
    }
  }

  static async validateCodeVerification(values) {
    Logger.info("Validating Two Step");
    const loginSchema = Joi.object({
      verificationToken: Joi.string()
        .required()
        .label("Verification Token")
        .messages({
          "string.base": "Verification Token must be a string",
          "any.required": "Verification Token is required",
        }),
      OTPCode: Joi.string()
        .min(6)
        .max(6)
        .required()
        .label("OTP Code")
        .messages({
          "string.base": "OTP code must be a string",
          "any.required": "OTP code is required",
          "string.min": "OTP Code must b 6 characters long",
          "string.max": "OTP Code must b 6 characters long",
        }),
    });

    try {
      const validated = await loginSchema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("Verification Token  validation error: ", error);
      error.status = 400;
      error.action = "CORRECT_INPUT";
      throw error;
    }
  }

  /**
   * Also login
   */
  static async validateTwoStep(values) {
    Logger.info("Validating Two Step");
    const loginSchema = Joi.object({
      verificationToken: Joi.string()
        .required()
        .label("Verification Token")
        .messages({
          "string.base": "Verification Token must be a string",
          "any.required": "Verification Token is required",
        }),
      OTPCode: Joi.string()
        .min(6)
        .max(6)
        .required()
        .label("OTP Code")
        .messages({
          "string.base": "OTP code must be a string",
          "any.required": "OTP code is required",
          "string.min": "OTP Code must b 6 characters long",
          "string.max": "OTP Code must b 6 characters long",
        }),
    });

    try {
      const validated = await loginSchema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("Verification Token  validation error: ", error);
      error.action = "CORRECT_INPUT";
      error.status = 400;
      throw error;
    }
  }

  static async validateTokenRefresh(values) {
    Logger.info("Validating Token Refresh");
    const loginSchema = Joi.object({
      refreshToken: Joi.string().required().label("Refresh Token").messages({
        "string.base": "Refresh Token must be a string",
        "any.required": "Refresh Token is required",
      }),
    });

    try {
      const validated = await loginSchema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("auth Token Refresh validation error: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateStaffSetup(values) {
    Logger.info("Validating Token Refresh");

    const schema = Joi.object({
      firstName: Joi.string()
        .label("First Name")
        .example("John")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),

      lastName: Joi.string()
        .label("Last Name")
        .example("Doe")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),

      employeeId: Joi.string()
        .label("Employee ID")
        .example("TUK/001")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),

      title: Joi.string()
        .valid("Prof", "Dr", "Mr", "Ms", "Mrs")
        .label("Title")
        .example("Mr")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "any.only":
            "{#label} must be one of the following: Prof, Dr, Mr, Ms, Mrs",
          "string.empty": "{#label} cannot be empty",
        }),

      schoolId: Joi.number()
        .integer()
        .label("School ID")
        .example(1)
        .required()
        .messages({
          "any.required": "{#label} is required",
          "number.base": "{#label} must be a number",
          "number.integer": "{#label} must be an integer",
          "number.empty": "{#label} cannot be empty",
        }),

      position: Joi.string()
        .label("Position")
        .example("Academic Staff")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),

      verificationToken: Joi.string()
        .label("Verification Token")
        .example("your-new-verification-token")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),
    });
    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("auth Token Refresh validation error: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateStudentSetup(values) {
    Logger.info("Validating Token Refresh");

    const schema = Joi.object({
      firstName: Joi.string()
        .label("First Name")
        .example("Jane")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),

      lastName: Joi.string()
        .label("Last Name")
        .example("Doe")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),

      registrationNumber: Joi.string()
        .label("Registration Number")
        .example("SCII/00819/2019")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),

      programmeId: Joi.number()
        .label("Programme Id")
        .min(0)
        .required()
        .messages({
          "any.required": "{#label} is required",
          "number.min": "{#label} cannot be less than 1",
        }),

      year: Joi.number().label("Programme Id").min(2013).required().messages({
        "any.required": "{#label} is required",
        "number.min": "{#label} cannot be less than 2013",
      }),

      verificationToken: Joi.string()
        .label("Verification Token")
        .example("your-new-verification-token")
        .required()
        .messages({
          "any.required": "{#label} is required",
          "string.empty": "{#label} cannot be empty",
        }),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("auth Token Refresh validation error: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateUpdate(values) {
    const schema = Joi.object({
      // Profile fields
      title: Joi.string().valid("Prof", "Dr", "Mr", "Ms", "Mrs").label("Title"),
      firstName: Joi.string().max(30).label("First Name"),
      lastName: Joi.string().max(30).label("Last Name"),
      bio: Joi.string().max(256).label("Bio"),
      position: Joi.string().max(30).label("Position"),
      profileAvatarId: Joi.number().integer().label("Profile Avatar ID"),
      coverImageId: Joi.number().integer().label("Cover Image ID"),
      // Preferences fields
      getMessagePushNotifications: Joi.boolean().label(
        "Get Message Push Notifications"
      ),
      getTaggingPushNotifications: Joi.boolean().label(
        "Get Tagging Push Notifications"
      ),
      getPostSharingPushNotifications: Joi.boolean().label(
        "Get Post Sharing Push Notifications"
      ),
      getFileSharedPushNotifications: Joi.boolean().label(
        "Get File Shared Push Notifications"
      ),
      appearance: Joi.string()
        .valid("automatic", "dark", "light")
        .label("Appearance"),
      userId: Joi.number().integer().label("User ID"),
      makeEmailPublic: Joi.boolean().label("Make Email Public"),
      favoriteColor: Joi.string().label("Favorite Color"),
      defaultAudience: Joi.string()
        .valid(
          "public",
          "private",
          "followers",
          "myclass",
          "myschool",
          "myfaculty"
        )
        .label("Default Audience"),
    }).messages({
      "any.required": "{#label} is required.",
      "string.base": "{#label} should be a string.",
      "string.max": "{#label} should not exceed {#limit} characters.",
      "number.base": "{#label} should be a number.",
      "number.integer": "{#label} should be an integer.",
      "boolean.base": "{#label} should be a boolean.",
      "string.valid": "{#label} should be one of {#valids}.",
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("update validation error: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateSearch(values) {
    const schema = Joi.object({
      page: Joi.number().default(1).optional(),
      searchString: Joi.string().allow("").default("").optional(),
      items: Joi.array()
        .items(
          Joi.string().valid(
            "posts",
            "users",
            "files",
            "folders",
            "chats",
            "classes",
            "programmes",
            "schools",
            "faculties"
          )
        )
        .required(),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("update validation error: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateShare(values) {
    const schema = Joi.object({
      items: Joi.object({
        post: Joi.number().optional(),
        // files: Joi.array().items(Joi.number()).optional(),
        // folders: Joi.array().items(Joi.number()).optional(),
        // polls: Joi.array().items(Joi.number()).optional(),
        file: Joi.number().optional(),
        folder: Joi.number().optional(),
        poll: Joi.number().optional(),
      }).required(),
      users: Joi.array().items(Joi.number()).optional(),
      schools: Joi.array().items(Joi.number()).optional(),
      classes: Joi.array().items(Joi.number()).optional(),
      faculties: Joi.array().items(Joi.number()).optional(),
      programmes: Joi.array().items(Joi.number()).optional(),
      chats: Joi.array().items(Joi.number()).optional(),
      action: Joi.string().valid("new", "update").optional().default("new"),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("share access validation error: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateTogglePublic(values) {
    const schema = Joi.object({
      type: Joi.string()
        .valid("post", "file", "folder")

        .required(),
      itemId: Joi.number().required(),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("update validation error: ", error);
      error.status = 400;
      throw error;
    }
  }
};
