const PostsController = require("./Controller");

const { AuthMiddleware } = require("../../middlewares");

const router = require("express").Router();

router.post("/", AuthMiddleware, PostsController.createOne);

router.get("/", AuthMiddleware, PostsController.getMany);

router.get("/:postId", AuthMiddleware, PostsController.getOne);

router.post("/:postId/like", AuthMiddleware, PostsController.likePost);
router.post("/:postId/unlike", AuthMiddleware, PostsController.unlikePost);

module.exports = router;
