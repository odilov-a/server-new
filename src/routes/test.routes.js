const { Router } = require("express");
const questionController = require("../controllers/test.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const questionRoutes = Router();

questionRoutes.get("/", authenticate, requireRole(["admin", "teacher", "student"]), questionController.getAllTest);
questionRoutes.post("/", authenticate, requireRole(["admin", "teacher"]), questionController.createTest);
questionRoutes.get("/teacher/tests", authenticate, requireRole(["admin", "teacher", "student"]), questionController.getByTeacher);

questionRoutes.get("/test/:id", authenticate, requireRole(["admin", "teacher", "student"]), questionController.getTestQuestions);

questionRoutes.post("/check/:id", authenticate, requireRole(["admin", "teacher", "student"]), questionController.checkAnswers);

questionRoutes.put("/grade/:id", authenticate, requireRole(["admin", "teacher"]), questionController.gradeAnswer);

questionRoutes.put("/:id", authenticate, requireRole(["admin", "teacher"]), questionController.updateTest);

questionRoutes.delete("/:id", authenticate, requireRole(["admin", "teacher"]), questionController.deleteTest);


module.exports = questionRoutes;
