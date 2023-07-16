const Joi = require("joi");

module.exports = class ProgrammesValidator {
  static async validateQuery(values) {
    const schema = Joi.object({
      searchString: Joi.string(),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("Programmes Query validation error: ", error);
      error.action = "CORRECT_INPUT";
      error.status = 400;
      throw error;
    }
  }
};
