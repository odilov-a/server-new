const { Router } = require("express");
const resultController = require("../controllers/result.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const resultRoutes = Router();

resultRoutes.get("/", authenticate, requireRole(["teacher", "admin", "student"]), resultController.getAllResults);
resultRoutes.get("/:id", authenticate, requireRole(["teacher", "admin", "student"]), resultController.getByIdResult);
resultRoutes.post("/", authenticate, requireRole(["teacher", "admin", "student"]), resultController.createResult);
resultRoutes.put("/:id", authenticate, requireRole(["teacher", "admin", "student"]), resultController.updateResult);
resultRoutes.delete("/:id", authenticate, requireRole(["teacher", "admin", "student"]), resultController.deleteResult);

module.exports = resultRoutes;
