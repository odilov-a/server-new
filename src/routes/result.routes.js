const { Router } = require("express");
const resultController = require("../controllers/result.controller.js");

const resultRoutes = Router();

resultRoutes.get("/", resultController.getAll);
resultRoutes.get("/:id", resultController.getById);
resultRoutes.post("/", resultController.create);
resultRoutes.put("/:id", resultController.update);
resultRoutes.delete("/:id", resultController.delete);

module.exports = resultRoutes;
