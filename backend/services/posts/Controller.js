const RequestHandler = require("../../RequestHandler");
const Logger = require("../../Logger");
const PostsValidator = require("./Validator");
const { prisma } = require("../../DatabaseInit");
const { Config } = require("../../configs");

module.exports = class PostsController {
  static async createOne(req, res) {
    try {
      Logger.info({ action: "create post", user: req.auth.id });
      const validated = await PostsValidator.validateCreate(req.body);

      const files = validated.files.map((id) => ({ id }));

      console.log("files: ", files);

      const createdPost = await prisma.post.create({
        data: {
          caption: validated.caption,
          visibility: validated.visibility,
          type: validated.type,
          owner: {
            connect: {
              id: req.auth.id,
            },
          },
          files: {
            connect: files,
          },
        },
        include: {
          files: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
              profileAvatar: true,
            },
          },
        },
      });
      RequestHandler.sendSuccess(req, res, createdPost);
    } catch (error) {
      console.log("Error creatiing post", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getMany(req, res) {
    try {
      Logger.info({ action: "get posts", user: req.auth.id });
      const page = parseInt(req.query.page) || 1;
      const pageSize = Config.POSTS_PER_PAGE;
      const skip = (page - 1) * pageSize;

      const posts = await prisma.post.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          files: true,
          _count: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatar: true,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, posts);
    } catch (error) {
      console.log("Error getting posts", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getOne(req, res) {
    try {
      Logger.info({ action: "Get One post", user: req.auth.id });
      const postId = parseInt(req.params.postId, 10);
      if (isNaN(postId)) {
        RequestHandler.throwError(
          400,
          "Invalid postId. Must be a number",
          null,
          "CORRECT_INPUT"
        )();
      }

      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          files: true,
          comments: true,
          likers: true,
          linkedPoll: true,
          _count: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatar: true,
            },
          },
        },
      });

      if (!post) {
        return res.status(404).json({ error: "Post not found." });
      }
    } catch (error) {
      console.log("Error getting post", error);
      RequestHandler.sendError(req, res, error);
    }
  }
};
