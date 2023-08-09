const Joi = require("joi");

module.exports = class PostsValidator {
  static async validateCreate(values) {
    const schema = Joi.object({
      files: Joi.array()
        .items(Joi.number().integer())
        .description("An array of file id associated with the post"),

      caption: Joi.string()
        .max(256)
        .description("The caption for the post (maximum 256 characters)"),

      type: Joi.string()
        .valid("social", "event", "sellable", "poll")
        .description("The type of the post"),

      visibility: Joi.string()
        .valid("public", "friends", "faculty", "school")
        .description("The visibility of the post"),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("error validating post creation: ", error);
      error.status = 400;
      throw error;
    }
  }

  static async validateComment(values) {
    const schema = Joi.object({
      message: Joi.string().max(256).required().label("Comment Message"),
      postId: Joi.number().required().label("Post ID"),
      commentId: Joi.number().optional().label("Comment ID"),
      type: Joi.string()
        .valid("normal", "reply")
        .required()
        .label("Comment Type"),
    }).messages({
      "string.base": "{#label} must be a string.",
      "string.empty": "{#label} cannot be empty.",
      "string.max": "{#label} should not exceed {#limit} characters.",
      "number.base": "{#label} must be a number.",
      "any.required": "{#label} is required.",
      "string.valid": "{#label} should be one of [normal, reply].",
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("error validating post creation: ", error);
      error.status = 400;
      throw error;
    }
  }
};
