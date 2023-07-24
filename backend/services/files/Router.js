const router = require("express").Router();
const {
  AuthMiddleware,
  OptionalAuthMiddleware,
  fileUploadFunction,
} = require("../../middlewares");
const FilesController = require("./Controller");

router.post(
  "/",
  AuthMiddleware,
  fileUploadFunction,
  FilesController.uploadFile
);

router.post("/folder", AuthMiddleware, FilesController.createFolder);

router.get("/", AuthMiddleware, FilesController.getFile);

router.get("/folder", AuthMiddleware, FilesController.getFolder);

module.exports = router;
