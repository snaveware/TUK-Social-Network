const router = require("express").Router();
const SchoolsController = require("./Controller");

router.get("/", SchoolsController.getMany);

module.exports = router;
