const PostsController = require("./Controller");

const { AuthMiddleware } = require("../../middlewares");

const router = require("express").Router();

router.post("/comment", AuthMiddleware, PostsController.comment);

router.post("/", AuthMiddleware, PostsController.createOne);

router.get("/", AuthMiddleware, PostsController.getMany);

router.get("/user/:userId", AuthMiddleware, PostsController.getUserPosts);

router.post(
  "/comments/:commentId/like",
  AuthMiddleware,
  PostsController.likeComment
);
router.post(
  "/comments/:commentId/unlike",
  AuthMiddleware,
  PostsController.unlikeComment
);

router.post("/:postId/like", AuthMiddleware, PostsController.likePost);
router.post("/:postId/unlike", AuthMiddleware, PostsController.unlikePost);

router.get("/:postId", AuthMiddleware, PostsController.getOne);

module.exports = router;
