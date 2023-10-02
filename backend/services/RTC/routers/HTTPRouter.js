const router = require("express").Router();
const { AuthMiddleware } = require("../../../middlewares");
const ChatsHTTPController = require("../controllers/HTTPController");

router.post("/", AuthMiddleware, ChatsHTTPController.createChat);

router.get("/", AuthMiddleware, ChatsHTTPController.getChats);

router.post("/resolvechat", AuthMiddleware, ChatsHTTPController.resolveChat);

router.get("/files/:chatId", AuthMiddleware, ChatsHTTPController.getChatFiles);
router.get(
  "/folders/:chatId",
  AuthMiddleware,
  ChatsHTTPController.getChatFolders
);

router.put("/:chatId", AuthMiddleware, ChatsHTTPController.updateChat);

router.get(
  "/messages/:chatId",
  AuthMiddleware,
  ChatsHTTPController.getMessages
);

router.get("/:chatId", AuthMiddleware, ChatsHTTPController.getChat);

module.exports = router;
