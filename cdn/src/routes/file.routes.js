const { Router } = require("express");
const fileController = require("../controllers/file.controller.js");
const { requestLogger } = require("../../../src/middlewares/request.middleware.js");
const fileRoutes = Router();

fileRoutes.post("/upload", requestLogger, fileController.upload);

module.exports = fileRoutes;