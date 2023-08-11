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
router.get("/folder", AuthMiddleware, FilesController.getFolder);
router.get("/:fileId", AuthMiddleware, FilesController.getFileObject);
router.get("/", AuthMiddleware, FilesController.getFile);
router.delete(
  "/folder/:folderId",
  AuthMiddleware,
  FilesController.deleteFolder
);
router.delete("/:fileId", AuthMiddleware, FilesController.deleteFile);

module.exports = router;
