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

              studentProfileIfIsStudent: {
                select: {
                  registrationNumber: true,
                },
              },
              staffProfileIfIsStaff: {
                select: {
                  title: true,
                  position: true,
                },
              },
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
              studentProfileIfIsStudent: {
                select: {
                  registrationNumber: true,
                },
              },
              staffProfileIfIsStaff: {
                select: {
                  title: true,
                  position: true,
                },
              },
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

  static async getUserPosts(req, res) {
    try {
      const userId = Number(req.params.userId) || req.auth.id;

      Logger.info(JSON.stringify({ action: "get posts", user: userId }));
      const page = parseInt(req.query.page) || 1;
      const pageSize = Config.POSTS_PER_PAGE;
      const skip = (page - 1) * pageSize;

      const posts = await prisma.post.findMany({
        where: {
          ownerId: userId,
        },
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
              studentProfileIfIsStudent: {
                select: {
                  registrationNumber: true,
                },
              },
              staffProfileIfIsStaff: {
                select: {
                  title: true,
                  position: true,
                },
              },
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
          comments: {
            include: {
              commentor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileAvatarId: true,
                  studentProfileIfIsStudent: {
                    select: {
                      registrationNumber: true,
                    },
                  },
                  staffProfileIfIsStaff: {
                    select: {
                      title: true,
                      position: true,
                    },
                  },
                },
              },
              likers: {
                select: {
                  id: true,
                },
              },
              _count: true,
            },
          },
          linkedPoll: true,
          _count: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: {
                select: {
                  registrationNumber: true,
                },
              },
              staffProfileIfIsStaff: {
                select: {
                  title: true,
                  position: true,
                },
              },
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

      await prisma.notification.create({
        data: {
          user: {
            connect: {
              id: updatedPost.ownerId,
            },
          },
          message: `${req.auth.firstName} ${req.auth.lastName} has liked your post`,
          associatedPost: {
            connect: {
              id: updatedPost.id,
            },
          },
          associatedUser: {
            connect: {
              id: req.auth.id,
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

  static async comment(req, res) {
    try {
      Logger.info(
        JSON.stringify({ action: "create comment", user: req.auth.id })
      );
      const validated = await PostsValidator.validateComment(req.body);

      if (validated.type == "reply" && !validated.commentId) {
        RequestHandler.throwError(
          400,
          "A reply must have a comment to reply to",
          null,
          "CORRECT_INPUT"
        );
      }

      const post = await prisma.post.findUnique({
        where: {
          id: validated.postId,
        },
        select: {
          ownerId: true,
          id: true,
        },
      });

      if (!post) {
        RequestHandler.throwError(404, "post not found")();
      }

      const createdComment = await prisma.comment.create({
        data: {
          message: validated.message,
          type: validated.type,
          post: {
            connect: {
              id: validated.postId,
            },
          },
          commentId: validated.commentId || undefined,
          commentor: {
            connect: {
              id: req.auth.id,
            },
          },
        },
        include: {
          commentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: {
                select: {
                  registrationNumber: true,
                },
              },
              staffProfileIfIsStaff: {
                select: {
                  title: true,
                  position: true,
                },
              },
            },
          },
          likers: {
            select: {
              id: true,
            },
          },
          _count: true,
        },
      });

      await prisma.notification.create({
        data: {
          user: {
            connect: {
              id: post.ownerId,
            },
          },
          message: `${req.auth.firstName} ${req.auth.lastName} has left a comment on your post`,
          associatedPost: {
            connect: {
              id: post.id,
            },
          },
          associatedComment: {
            connect: {
              id: createdComment.id,
            },
          },
          associatedUser: {
            connect: {
              id: req.auth.id,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, createdComment);
    } catch (error) {
      console.log("Error creating comment", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async likeComment(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "Like comment",
          user: req.auth.id,
          commentId: req.params.commentId,
        })
      );

      const commentId = parseInt(req.params.commentId, 10);
      if (isNaN(commentId)) {
        return RequestHandler.throwError(
          400,
          "Invalid commentId. Must be a number"
        )();
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
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

      if (!comment) {
        return RequestHandler.throwError(404, "comment not found")();
      }

      if (comment.likers.length > 0) {
        return RequestHandler.throwError(
          409,
          "comment already liked by the user"
        )();
      }

      const userId = req.auth.id; // Use the authenticated user's ID

      // Update the comment to add the user as a liker
      const updatedComment = await prisma.comment.update({
        where: {
          id: commentId,
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
          post: {
            select: {
              id: true,
            },
          },
        },
      });

      await prisma.notification.create({
        data: {
          user: {
            connect: {
              id: updatedComment.commentorId,
            },
          },
          message: `${req.auth.firstName} ${req.auth.lastName} has liked your comment`,
          associatedPost: {
            connect: {
              id: updatedComment.post.id,
            },
          },
          associatedComment: {
            connect: {
              id: comment.id,
            },
          },
          associatedUser: {
            connect: {
              id: req.auth.id,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, updatedComment);
    } catch (error) {
      console.log("error liking comment: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async unlikeComment(req, res) {
    try {
      Logger.info(
        JSON.stringify({ action: "unLike comment", user: req.auth.id })
      );

      const commentId = parseInt(req.params.commentId, 10);
      if (isNaN(commentId)) {
        return RequestHandler.throwError(
          400,
          "Invalid postId. Must be a number"
        )();
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
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

      if (!comment) {
        return RequestHandler.throwError(404, "comment not found")();
      }

      if (comment.likers.length < 0) {
        return RequestHandler.throwError(
          409,
          "comment not liked by the user"
        )();
      }

      const userId = req.auth.id; // Use the authenticated user's ID

      // Update the comment to add the user as a liker
      const updatedComment = await prisma.comment.update({
        where: {
          id: commentId,
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

      RequestHandler.sendSuccess(req, res, updatedComment);
    } catch (error) {
      console.log("error unliking Comment: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }
};
