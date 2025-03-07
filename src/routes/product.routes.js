const { Router } = require("express");
const productController = require("../controllers/product.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const productRoutes = Router();

productRoutes.get("/", authenticate, requireRole(["admin", "teacher", "student"]), productController.getAllProducts);
productRoutes.post("/", authenticate, requireRole(["admin"]), productController.createProduct);

productRoutes.get("/:id", authenticate, requireRole(["admin", "teacher", "student"]), productController.getOneProduct);
productRoutes.put("/:id", authenticate, requireRole(["admin"]), productController.updateProduct);
productRoutes.delete("/:id", authenticate, requireRole(["admin"]), productController.deleteProduct);

module.exports = productRoutes;
