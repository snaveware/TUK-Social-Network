const router = require("express").Router();
const AuthController = require("./Controller");

router.post("/sendemailcode", AuthController.sendEmailCode);

router.post("/login", AuthController.login);

router.post("/refreshtoken", AuthController.refreshToken);

router.post("/setup-student", AuthController.studentSetup);

router.post("/setup-staff", AuthController.staffSetup);

module.exports = router;
