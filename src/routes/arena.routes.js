const { Router } = require("express");
const arenaController = require("../controllers/arena.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const arenaRouter = Router();

arenaRouter.get("/", authenticate, requireRole(["teacher", "admin", "student"]), arenaController.getAllArena);
arenaRouter.get("/all", authenticate, requireRole(["teacher", "admin", "student"]), arenaController.allArena);
arenaRouter.get("/:id", authenticate, requireRole(["teacher", "admin", "student"]), arenaController.getArenaById);
arenaRouter.post("/", authenticate, requireRole(["admin"]), arenaController.createArena);
arenaRouter.put("/:id", authenticate, requireRole(["admin"]), arenaController.updateArena);
arenaRouter.delete("/:id", authenticate, requireRole(["admin"]), arenaController.deleteArena);

module.exports = arenaRouter;
