const { Router } = require("express");
const resourceController = require("../controllers/resource.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const resourceRouter = Router();

resourceRouter.get("/", authenticate, requireRole(["admin", "teacher", "student"]), resourceController.getAllResources);
resourceRouter.get("/teacher/resource", authenticate, requireRole(["teacher"]), resourceController.getResourcesByTeacher);
resourceRouter.post("/",  authenticate, requireRole(["admin", "teacher"]), resourceController.createResource);

resourceRouter.get("/:id", authenticate, requireRole(["admin", "teacher", "student"]), resourceController.getResourceById);
resourceRouter.put("/:id", authenticate, requireRole(["admin", "teacher"]), resourceController.updateResource);
resourceRouter.delete("/:id", authenticate, requireRole(["admin", "teacher"]), resourceController.deleteResource);

module.exports = resourceRouter;
