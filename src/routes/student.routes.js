const { Router } = require("express");
const studentController = require("../controllers/student.controller.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
const { requireRole } = require("../middlewares/role.middleware.js");
const studentRouter = Router();

studentRouter.post("/login", studentController.loginStudent);
studentRouter.post("/register", studentController.registerStudent);
studentRouter.post("/admin/register", authenticate, requireRole(["admin"]), studentController.adminRegisterStudent);

studentRouter.get("/", authenticate, requireRole(["admin", "student"]), studentController.getAllStudents);
studentRouter.get("/me", authenticate, requireRole(["student"]), studentController.getMeStudent);
studentRouter.get("/search", authenticate, requireRole(["admin"]), studentController.searchStudentByFirstNameLastName);
studentRouter.get("/top/balance", authenticate, requireRole(["admin", "teacher", "student"]), studentController.getTopStudentsByBalance);

studentRouter.get("/histories", authenticate, requireRole(["admin", "student", "teacher"]), studentController.getAllStudentsHistory);
studentRouter.put("/update-student", authenticate, requireRole(["student"]), studentController.meUpdateStudent);
studentRouter.get("/:id/attempts", authenticate, requireRole(["admin", "teacher"]), studentController.getAttemptByStudentId);

studentRouter.get("/:id", authenticate, requireRole(["admin"]), studentController.getStudentById);
studentRouter.put("/:id", authenticate, requireRole(["admin"]), studentController.updateStudent);
studentRouter.delete("/:id", authenticate, requireRole(["admin"]), studentController.deleteStudent);

module.exports = studentRouter;
