const express = require("express");
const router = express.Router();
const errorController = require("../controllers/error.controllers");

router.get("404", errorController.get404);

module.exports = router;
