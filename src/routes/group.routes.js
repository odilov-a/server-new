const { Router } = require("express");
const groupController = require("../controllers/group.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const groupRoutes = Router();

groupRoutes.get("/", authenticate, requireRole(["admin", "teacher", "student"]), groupController.getAllGroups);
groupRoutes.get("/:id", authenticate, requireRole(["admin", "teacher", "student"]), groupController.getByIdGroup);
groupRoutes.post("/", authenticate, requireRole(["admin", "teacher", "student"]), groupController.createGroup);
groupRoutes.put("/:id", authenticate, requireRole(["admin", "teacher", "student"]), groupController.updateGroup);
groupRoutes.delete("/:id", authenticate, requireRole(["admin", "teacher", "student"]), groupController.deleteGroup);

module.exports = groupRoutes;
