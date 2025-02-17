const { Router } = require("express");
const questionController = require("../controllers/question.controller.js");

const questionRoutes = Router();

questionRoutes.get("/", questionController.getAll);
questionRoutes.post("/", questionController.create);
questionRoutes.put("/:id", questionController.update);
questionRoutes.post("/check/:id", questionController.checkAnswers);

module.exports = questionRoutes;
