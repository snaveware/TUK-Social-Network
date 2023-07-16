const { prisma } = require("../../DatabaseInit");
const RequestHandler = require("../../RequestHandler");
const SchoolsValidator = require("./Validator");

module.exports = class SchoolsController {
  static async getMany(req, res) {
    try {
      const validated = await SchoolsValidator.validateQuery(req.query);

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

      const schools = await prisma.school.findMany({
        where: whereClause,
        orderBy: {
          abbreviation: "asc",
        },
      });

      RequestHandler.sendSuccess(req, res, schools);
    } catch (error) {
      RequestHandler.sendError(req, res, error);
      console.log("Error getting Many Schools: ", error);
    }
  }
};
