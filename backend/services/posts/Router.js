const PostsController = require("./Controller");

const { AuthMiddleware } = require("../../middlewares");

const router = require("express").Router();

router.post("/", AuthMiddleware, PostsController.createOne);

router.get("/", AuthMiddleware, PostsController.getMany);

router.get("/:postId", AuthMiddleware, PostsController.getOne);

module.exports = router;
