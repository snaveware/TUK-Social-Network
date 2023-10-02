const router = require("express").Router();
const { AuthMiddleware } = require("../../middlewares");
const AuthController = require("./Controller");

router.put("/user/follow/:userId", AuthMiddleware, AuthController.followUser);
router.put(
  "/user/unfollow/:userId",
  AuthMiddleware,
  AuthController.unFollowUser
);

router.put("/users/togglepublic", AuthMiddleware, AuthController.togglePublic);

router.put("/users/share", AuthMiddleware, AuthController.share);

router.put("/users/savepost/:postId", AuthMiddleware, AuthController.savePost);
router.put("/users/repost/:postId", AuthMiddleware, AuthController.rePost);

router.get(
  "/user/notifications",
  AuthMiddleware,
  AuthController.getNotifications
);

router.put(
  "/user/notifications/:notificationId/dismiss",
  AuthMiddleware,
  AuthController.dismissNotification
);
router.post("/user/search", AuthMiddleware, AuthController.search);
router.put("/user/:userId", AuthMiddleware, AuthController.updateUser);

router.get("/user/:userId", AuthMiddleware, AuthController.getUser);

router.post("/sendemailcode", AuthController.sendEmailCode);

router.post("/login", AuthController.login);

router.post("/refreshtoken", AuthController.refreshToken);

router.post("/student-setup", AuthController.studentSetup);

router.post("/setup-staff", AuthController.staffSetup);

module.exports = router;
