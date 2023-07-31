const RequestHandler = require("../../RequestHandler");
const Logger = require("../../Logger");
const PostsValidator = require("./Validator");
const { prisma } = require("../../DatabaseInit");
const { Config } = require("../../configs");

module.exports = class PostsController {
  static async createOne(req, res) {
    try {
      Logger.info(JSON.stringify({ action: "create post", user: req.auth.id }));
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
              profileAvatarId: true,
            },
          },
          likers: {
            select: {
              id: true,
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
      Logger.info(JSON.stringify({ action: "get posts", user: req.auth.id }));
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
              profileAvatarId: true,
            },
          },
          likers: {
            where: {
              id: req.auth.id,
            },
            select: {
              id: true,
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
      Logger.info(
        JSON.stringify({ action: "Get One post", user: req.auth.id })
      );
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
              profileAvatarId: true,
            },
          },
          likers: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!post) {
        RequestHandler.throwError(404, "Post Not Found");
      }

      RequestHandler.sendSuccess(req, res, post);
    } catch (error) {
      console.log("Error getting post", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async likePost(req, res) {
    try {
      Logger.info(JSON.stringify({ action: "Like Post", user: req.auth.id }));

      const postId = parseInt(req.params.postId, 10);
      if (isNaN(postId)) {
        return RequestHandler.throwError(
          400,
          "Invalid postId. Must be a number"
        )();
      }

      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          likers: {
            where: {
              id: req.auth.id,
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!post) {
        return RequestHandler.throwError(404, "Post not found")();
      }

      if (post.likers.length > 0) {
        return RequestHandler.throwError(
          409,
          "Post already liked by the user"
        )();
      }

      const userId = req.auth.id; // Use the authenticated user's ID

      // Update the post to add the user as a liker
      const updatedPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likers: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          _count: true,
          likers: {
            where: {
              id: req.auth.id,
            },
            select: {
              id: true,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, updatedPost);
    } catch (error) {
      console.log("error liking post: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async unlikePost(req, res) {
    try {
      Logger.info(JSON.stringify({ action: "unLike Post", user: req.auth.id }));

      const postId = parseInt(req.params.postId, 10);
      if (isNaN(postId)) {
        return RequestHandler.throwError(
          400,
          "Invalid postId. Must be a number"
        )();
      }

      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          likers: {
            where: {
              id: req.auth.id,
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!post) {
        return RequestHandler.throwError(404, "Post not found")();
      }

      if (post.likers.length < 0) {
        return RequestHandler.throwError(409, "Post not liked by the user")();
      }

      const userId = req.auth.id; // Use the authenticated user's ID

      // Update the post to add the user as a liker
      const updatedPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likers: {
            disconnect: {
              id: userId,
            },
          },
        },
        include: {
          _count: true,
          likers: {
            where: {
              id: req.auth.id,
            },
            select: {
              id: true,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, updatedPost);
    } catch (error) {
      console.log("error unliking post: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }
};
