const Joi = require("joi");
module.exports = class ChatsValidator {
  static async validateCreate(values) {
    const schema = Joi.object({
      name: Joi.string().required().max(256).label("Name").messages({
        "any.required": "{#label} is required.",
        "string.base": "{#label} should be a string.",
        "string.max": "{#label} should not exceed 256 characters.",
      }),
      description: Joi.string().max(1000).label("Description").messages({
        "string.base": "{#label} should be a string.",
        "string.max": "{#label} should not exceed 1000 characters.",
      }),
      chatType: Joi.string()
        .valid("group", "private", "public", "one_to_chat")
        .required()
        .label("Chat Type")
        .messages({
          "any.required": "{#label} is required.",
          "string.base": "{#label} should be a string.",
          "any.only":
            "{#label} should be one of 'group', 'private', or 'public'.",
        }),
      members: Joi.array()
        .items(Joi.number().integer())
        .min(1)
        .unique()
        .required()
        .label("Members")
        .messages({
          "any.required": "{#label} is required.",
          "array.base": "{#label} should be an array.",
          "array.min": "{#label} must have at least 1 member.",
          "array.unique": "{#label} must have unique members.",
          "number.base": "{#label} should be a number.",
          "number.integer": "{#label} should be an integer.",
        }),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("error validating CHAT creation: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateCreateMessage(values) {
    const schema = Joi.object({
      message: Joi.string()
        .min(1)
        .max(1000) // Updated maximum length to 1000 characters
        .required()
        .label("Message")
        .messages({
          "string.base": "{#label} should be a type of text",
          "string.empty": "{#label} cannot be empty",
          "string.min": "{#label} should have a minimum length of {#limit}",
          "string.max": "{#label} should have a maximum length of {#limit}",
          "any.required": "{#label} is required",
        }),

      chatId: Joi.number().integer().required().label("Chat ID").messages({
        "number.base": "{#label} should be a type of number",
        "number.integer": "{#label} should be an integer",
        "any.required": "{#label} is required",
      }),

      attachedFiles: Joi.array()
        .items(Joi.number().integer())
        .optional()
        .label("Attached Files")
        .messages({
          "array.base": "{#label} should be an array",
          "array.items": "{#label} should contain only integers",
        }),

      replyingToId: Joi.number()
        .integer()
        .optional()
        .label("Replying To ID")
        .messages({
          "number.base": "{#label} should be a type of number",
          "number.integer": "{#label} should be an integer",
        }),

      postId: Joi.number()
        .integer()
        .optional()
        .label("Linked Post ID")
        .messages({
          "number.base": "{#label} should be a type of number",
          "number.integer": "{#label} should be an integer",
        }),

      linkedPollId: Joi.number()
        .integer()
        .optional()
        .label("Linked Poll ID")
        .messages({
          "number.base": "{#label} should be a type of number",
          "number.integer": "{#label} should be an integer",
        }),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("error validating Message creation: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateChatResolution(values) {
    const schema = Joi.object({
      chatId: Joi.number().optional().label("Chat ID").messages({
        "any.required": "{#label} is required.",
        "number.base": "{#label} must be a number.",
      }),
      otherUserId: Joi.number().optional().label("Other User ID").messages({
        "number.base": "{#label} must be a number.",
      }),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("error validating CHAT resolution: ", error);
      error.status = 400;
      throw error;
    }
  }
};
