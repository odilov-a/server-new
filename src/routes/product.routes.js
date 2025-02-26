const { Router } = require("express");
const productController = require("../controllers/product.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const productRoutes = Router();

productRoutes.get("/", authenticate, requireRole(["admin", "teacher", "student"]), productController.getAll);
productRoutes.post("/", authenticate, requireRole(["admin"]), productController.create);
productRoutes.put("/:id", authenticate, requireRole(["admin"]), productController.update);
productRoutes.delete("/:id", authenticate, requireRole(["admin"]), productController.delete);

module.exports = productRoutes;
