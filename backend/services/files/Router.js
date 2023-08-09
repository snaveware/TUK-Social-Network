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

module.exports = router;
