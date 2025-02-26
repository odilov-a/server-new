const { Router } = require("express");
const orderController = require("../controllers/order.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const orderRoutes = Router();

orderRoutes.get("/", authenticate, requireRole(["admin", "teacher", "student"]), orderController.getAllOrders);
orderRoutes.post("/", authenticate, requireRole(["student"]), orderController.createOrder);
orderRoutes.delete("/:id", authenticate, requireRole(["admin", "student"]), orderController.cancelOrder);

module.exports = orderRoutes;
