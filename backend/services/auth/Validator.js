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
};
