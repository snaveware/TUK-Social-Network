const { prisma } = require("../../DatabaseInit");
const RequestHandler = require("../../RequestHandler");
const ProgrammesValidator = require("./Validator");

module.exports = class programmesController {
  static async getMany(req, res) {
    try {
      const validated = await ProgrammesValidator.validateQuery(req.query);

      let whereClause = {};
      if (validated.searchString) {
        whereClause = {
          OR: [
            {
              abbreviation: {
                contains: validated.searchString,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: validated.searchString,
                mode: "insensitive",
              },
            },
          ],
        };
      }

      console.log("Where clause", whereClause);

      const programmes = await prisma.programme.findMany({
        where: whereClause,
        orderBy: {
          abbreviation: "asc",
        },
      });

      RequestHandler.sendSuccess(req, res, programmes);
    } catch (error) {
      RequestHandler.sendError(req, res, error);
      console.log("Error getting Many programmes: ", error);
    }
  }
};
