const { Router } = require("express");
const testController = require("../controllers/test.controller.js");
const { requestLogger } = require("../../../src/middlewares/request.middleware.js");
const testRoutes = Router();

testRoutes.post("/upload", requestLogger, testController.upload);

module.exports = testRoutes;