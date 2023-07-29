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
};
