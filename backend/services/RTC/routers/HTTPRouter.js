const router = require("express").Router();
const { AuthMiddleware } = require("../../../middlewares");
const ChatsHTTPController = require("../controllers/HTTPController");

router.post("/", AuthMiddleware, ChatsHTTPController.createChat);

router.get("/", AuthMiddleware, ChatsHTTPController.getChats);

router.post("/resolvechat", AuthMiddleware, ChatsHTTPController.resolveChat);

router.put("/:chatId", AuthMiddleware, ChatsHTTPController.updateChat);

router.get("/:chatId", AuthMiddleware, ChatsHTTPController.getChat);

module.exports = router;
