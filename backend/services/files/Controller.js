const { prisma } = require("../../DatabaseInit");
const Logger = require("../../Logger");
const RequestHandler = require("../../RequestHandler");
const Utils = require("../../Utils");
const FilesValidator = require("./Validator");
module.exports = class FilesController {
  static async uploadFile(req, res) {
    try {
      console.log("request body: ", req.body, "file: ", req.file);
      Logger.info(
        JSON.stringify({
          action: "uploading file",
          userId: req.auth.id,
          folder: req.query.fid,
        })
      );

      let folderId = Number(req.query.folderId);

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
          type: Utils.getFileTypeFromMimeType(fileUpload.mimetype),
          owner: {
            connect: {
              id: req.auth.id,
            },
          },
          Access: {
            create: {
              isPublic: false,
              itemType: "file",
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
          Access: {
            create: {
              itemType: "folder",
              isPublic: false,
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
        res.end(404);
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
        res.end(404);
        return;
      }

      const filePath = global.appRoot + "/uploads/" + file.name;

      RequestHandler.sendFile(req, res, filePath);
    } catch (error) {
      console.log("Error uploading file: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getFileObject(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "getting file",
          userId: req.auth.id,
          folder: req.query.fid,
        })
      );
      const fileId = Number(req.params.fileId);

      if (!fileId) {
        Logger.error(
          JSON.stringify({
            action: "get file",
            file: fileId,
            user: req.auth.id,
            message: "File id not provided",
          })
        );
        RequestHandler.throwError(400, "File Id is Required")();
      }

      /**
       * Todo: check whether user has access to file
       */

      const file = await prisma.file.findUnique({
        where: {
          id: fileId,
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              staffProfileIfIsStaff: true,
              studentProfileIfIsStudent: true,
              profileAvatarId: true,
            },
          },
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
        RequestHandler.throwError(404, "File not found")();
      }

      RequestHandler.sendSuccess(req, res, file);
    } catch (error) {
      console.log("Error getting File Object: ", error);
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

  static async deleteFile(req, res) {
    try {
      const fileId = Number(req.params.fileId);

      if (!fileId) {
        RequestHandler.throwError(400, "File ID is required")();
      }

      const file = await prisma.file.findUnique({
        where: {
          id: fileId,
        },
        select: {
          id: true,
          Post: true,
          chatIfProfile: true,
          messagesAttachedTo: true,
          userIfProfileAvatar: true,
          userIfCoverImage: true,
          ownerId: true,
        },
      });

      if (file.ownerId !== req.auth.id) {
        RequestHandler.throwError(403, "You can only delete your own files")();
      }

      if (file.Post) {
        RequestHandler.throwError(
          400,
          "A file cannot be deleted whilst it's attached to a post"
        )();
      }

      if (file.messagesAttachedTo.length > 1) {
        RequestHandler.throwError(
          400,
          "A File cannot be deleted whilst it is attached to a message"
        )();
      }

      if (file.chatIfProfile) {
        RequestHandler.throwError(
          400,
          "A file cannot be deleted while it is used as chat profile"
        )();
      }

      if (file.userIfProfileAvatar) {
        RequestHandler.throwError(
          400,
          "A file cannot be deleted while it is used as a Profile image"
        )();
      }

      if (file.userIfCoverImage) {
        RequestHandler.throwError(
          400,
          "A File cannot be deleted while it's used as a cover image"
        )();
      }

      const deletion = await prisma.file.delete({
        where: {
          id: fileId,
        },
      });

      RequestHandler.sendSuccess(req, res, deletion);
    } catch (error) {
      console.log("Error deleting file: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async deleteFolder(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "delete folder",
          user: req.auth.id,
          folder: req.params.folderId,
        })
      );
      const folderId = Number(req.params.folderId);

      if (!folderId) {
        RequestHandler.throwError(400, "folder Id is required")();
      }

      if (folderId === req.auth.rootFolderId) {
        RequestHandler.throwError(400, "You cannot delete your root folder")();
      }

      const folder = await prisma.folder.findUnique({
        where: {
          id: folderId,
        },
        include: {
          _count: true,
          owner: true,
        },
      });

      if (!folder) {
        RequestHandler.throwError(404, "Folder not found")();
      }

      if (!folder.owner || folder.owner.id !== req.auth.id) {
        RequestHandler.throwError(
          403,
          "You can only delete your own folders"
        )();
      }

      if (
        folder._count.files.length > 0 ||
        folder._count.childFolders.length > 0
      ) {
        RequestHandler.throwError(400, "The folder is not empty")();
      }

      const deletion = await prisma.folder.delete({
        where: {
          id: folderId,
        },
      });
    } catch (error) {
      console.log("Error deleting folder: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }
};
