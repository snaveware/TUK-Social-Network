const router = require("express").Router();
const ProgrammesController = require("./Controller");

router.get("/", ProgrammesController.getMany);

module.exports = router;
