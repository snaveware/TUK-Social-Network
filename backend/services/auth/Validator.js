const Joi = require("joi");
const Logger = require("../../Logger");
const RequestHandler = require("../../RequestHandler");

module.exports = class AuthValidator {
  static async validateSendEmailCode(values) {
    Logger.info("Validating Send Email Code");
    const loginSchema = Joi.object({
      email: Joi.string().required().label("Email").email().messages({
        "string.base": "Email must be a string",
        "any.required": "Email is required",
        "string.email": "Must be a valid email address",
      }),
    });

    try {
      const validated = await loginSchema.validateAsync(values);
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

      year: Joi.number().label("Programme Id").min(2000).required().messages({
        "any.required": "{#label} is required",
        "number.min": "{#label} cannot be less than 2000",
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
};
