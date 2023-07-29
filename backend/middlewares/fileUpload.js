const Multer = require("multer");

const { v4: uuid } = require("uuid");

const localDestination = `${global.appRoot}/uploads`;

const fileUploadMulter = Multer({
  storage: Multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, localDestination);
    },

    filename: (req, file, cb) => {
      console.log("file middleware multer:  ", file);
      let extension;
      let filename;
      if (file.originalname) {
        extension = file.originalname.split(".").pop();
        console.log("File", extension, file, file.originalname);
        filename = `${file.originalname}`;
      } else {
        extension = file.mimetype.split("/").pop();
        filename = `${uuid()}.${extension}`;
      }

      console.log("filename: ", filename);

      cb(null, filename);
    },
  }),
});

const fileUploadFunction = fileUploadMulter.single("file");

const profilesUploadMulter = Multer({
  storage: Multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, localDestination);
    },
    filename: (req, file, cb) => {
      const extension = file.originalname.split(".").pop();
      // console.log(extension, file, file.originalname);
      const filename = `${file.fieldname}_${uuid()}.${extension}`;
      cb(null, filename);
    },
  }),
});

const ProfileAvatarUploadFunction =
  profilesUploadMulter.single("profileAvatar");
const ProfileCoverUploadFunction = profilesUploadMulter.single("profileCover");

const ProfileUploadFunction = profilesUploadMulter.fields([
  {
    name: "profileAvatar",
    maxCount: 1,
  },
  {
    name: "profileCover",
    maxCount: 1,
  },
]);

module.exports = {
  fileUploadFunction,
  ProfileAvatarUploadFunction,
  ProfileCoverUploadFunction,
};
