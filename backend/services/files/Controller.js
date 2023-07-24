const { prisma } = require("../../DatabaseInit");
const Logger = require("../../Logger");
const RequestHandler = require("../../RequestHandler");
const FilesValidator = require("./Validator");
module.exports = class FilesController {
  static async uploadFile(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "uploading file",
          userId: req.auth.id,
          folder: req.query.fid,
        })
      );

      let folderId = req.query.folderId;

      if (!folderId) {
        folderId = req.auth.rootFolderId;
      }

      const fileUpload = req.file;
      console.log("uploaded file: ", fileUpload);
      if (!fileUpload) {
        RequestHandler.throwError(400, "File not uploaded")();
      }

      const folder = await prisma.folder.findUnique({
        where: {
          id: folderId,
        },
      });

      if (!folder) {
        RequestHandler.throwError(404, "Folder not found")();
      }

      const createdFile = await prisma.file.create({
        data: {
          name: req.file.filename,
          path: `${folder.path}/${fileUpload.filename}`,
          owner: {
            connect: {
              id: req.auth.id,
            },
          },
          folder: {
            connect: {
              id: folder.id,
            },
          },
        },
      });

      RequestHandler.sendSuccess(req, res, { ...createdFile, folder: folder });
    } catch (error) {
      console.log("Error uploading file: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async createFolder(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "creating folder",
          userId: req.auth.id,
          folder: req.query.fid,
        })
      );

      const validated = await FilesValidator.validateFolder(req.body);

      const folder = await prisma.folder.findUnique({
        where: {
          id: validated.parentFolderId,
        },
      });

      if (!folder) {
        RequestHandler.throwError(404, "Folder not found")();
      }

      const createdFolder = await prisma.folder.create({
        data: {
          name: validated.folderName,
          path: `${folder.path}/${validated.folderName}`,
          owner: {
            connect: {
              id: req.auth.id,
            },
          },
          parentFolder: {
            connect: {
              id: folder.id,
            },
          },
        },
      });
      RequestHandler.sendSuccess(req, res, {
        ...createdFolder,
        parentFolder: folder,
      });
    } catch (error) {
      console.log("Error uploading file: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getFile(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "getting file",
          userId: req.auth.id,
          folder: req.query.fid,
        })
      );
      const fileId = Number(req.query.fid);

      if (!fileId) {
        Logger.error(
          JSON.stringify({
            action: "get file",
            file: fileId,
            user: req.auth.id,
            message: "File id not provided",
          })
        );
        req.end(404);
        return;
      }

      /**
       * Todo: check whether user has access to file
       */

      const file = await prisma.file.findUnique({
        where: {
          id: fileId,
        },
      });

      if (!file) {
        Logger.error(
          JSON.stringify({
            action: "get file",
            file: fileId,
            user: req.auth.id,
          })
        );
        req.end(404);
        return;
      }

      const filePath = global.appRoot + "/uploads/" + file.name;

      RequestHandler.sendFile(req, res, filePath);
    } catch (error) {
      console.log("Error uploading file: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getFolder(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "getting folder",
          userId: req.auth.id,
          folder: req.query.fid,
        })
      );
      const folderId = Number(req.query.fid);

      if (!folderId) {
        RequestHandler.throwError(400, "Folder id not provided")();
      }

      /**
       * Todo: check whether user has access to file
       */

      const folder = await prisma.folder.findUnique({
        where: {
          id: folderId,
        },
        include: {
          files: true,
          childFolders: true,
          parentFolder: true,
        },
      });

      if (!folder) {
        RequestHandler.throwError(404, "Folder not found")();
      }

      RequestHandler.sendSuccess(req, res, folder);
    } catch (error) {
      console.log("Error uploading file: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }
};
