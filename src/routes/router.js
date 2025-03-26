const { Router } = require("express");
const orderRoutes = require("./order.routes.js");
const adminRoutes = require("./admin.routes.js");
const arenaRoutes = require("./arena.routes.js");
const questionRoutes = require("./test.routes.js");
const passedRoutes = require("./passed.routes.js")
const studentRoutes = require("./student.routes.js");
const subjectRoutes = require("./subject.routes.js");
const problemRoutes = require("./problem.routes.js");
const teacherRoutes = require("./teacher.routes.js");
const productRoutes = require("./product.routes.js");
const feedbackRoutes = require("./feedback.routes.js");
const resourceRoutes = require("./resource.routes.js");
const statisticsRoutes = require("./statistics.routes.js");
const difficultyRoutes = require("./difficulty.routes.js");
const translationRoutes = require("./translation.routes.js");
const router = Router();

router.use("/arena", arenaRoutes);
router.use("/admins", adminRoutes);
router.use("/orders", orderRoutes);
router.use("/passed", passedRoutes)
router.use("/tests", questionRoutes);
router.use("/students", studentRoutes);
router.use("/problems", problemRoutes);
router.use("/subjects", subjectRoutes);
router.use("/teachers", teacherRoutes);
router.use("/products", productRoutes);
router.use("/feedbacks", feedbackRoutes);
router.use("/resources", resourceRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/difficulties", difficultyRoutes);
router.use("/translations", translationRoutes);

module.exports = router;
