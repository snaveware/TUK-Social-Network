const Joi = require("joi");

module.exports = class FilesValidator {
  static async validateFolder(values) {
    const schema = Joi.object({
      parentFolderId: Joi.number()
        .label("Parent Folder ID")
        .required()
        .messages({
          "any.required": "Parent Folder Id is required",
        }),
      folderName: Joi.string()
        .label("Folder Name")
        .max(30)
        .required()
        .messages({
          "any.required": "Folder Name is required",
          "any.max": "Folder Name cannot be more than 30 characters",
        }),
      // access: Joi.object({
      //   users: Joi.array().items(Joi.number()).optional(),
      //   schools: Joi.array().items(Joi.number()).optional(),
      //   classes: Joi.array().items(Joi.number()).optional(),
      //   faculties: Joi.array().items(Joi.number()).optional(),
      //   programmes: Joi.array().items(Joi.number()).optional(),
      //   chats: Joi.array().items(Joi.number()).optional(),
      //   isPublic: Joi.boolean().default(false),
      // }).optional(),
    });

    try {
      const validated = await schema.validateAsync(values);
      return validated;
    } catch (error) {
      console.log("folder creation: ", error);
      error.status = 400;
      throw error;
    }
  }
};
