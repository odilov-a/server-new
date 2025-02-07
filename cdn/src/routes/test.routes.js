const { Router } = require("express");
const testController = require("../controllers/test.controller.js");
const { authenticate } = require("../../../src/middlewares/auth.middleware.js");
const { requireRole } = require("../../../src/middlewares/role.middleware.js");
const testRoutes = Router();

testRoutes.post("/upload", authenticate, requireRole(["admin", "student", "teacher"]), testController.upload);

module.exports = testRoutes;