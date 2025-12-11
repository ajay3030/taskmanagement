const express = require("express");
const router = express.Router();
const { multiUpload } = require("../middlewares/upload.middleware");
const uploadController = require("../controllers/upload.controller");

router.post("/multi", multiUpload, uploadController.uploadMultipleFiles);

module.exports = router;
