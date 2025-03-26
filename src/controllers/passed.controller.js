const Passed = require("../models/Passed.js");

exports.getAllPassed = async (req, res) => {
  try {
    const { lang } = req.query;
    const data = await Passed.find().populate("student").populate("test");
    const formattedData = data.map((item) => {
      const totalQuestions = item.answers?.length || 0;
      let correctAnswers = 0;

      if (Array.isArray(item.answers)) {
        correctAnswers = item.answers.filter((answer) => {
          if (!answer.selectedAnswer || !answer.correctAnswer) return false;
          const selected = String(answer.selectedAnswer).trim().toLowerCase();
          const correct = String(answer.correctAnswer).trim().toLowerCase();
          return selected === correct;
        }).length;
      }

      const incorrectAnswers = totalQuestions - correctAnswers;
      const testName =
        item.test?.[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
      return {
        id: item._id,
        student: {
          name: `${item.student?.firstName || ""} ${
            item.student?.lastName || ""
          }`.trim(),
        },
        test: {
          name: testName,
        },
        stats: {
          totalQuestions,
          correctAnswers,
          incorrectAnswers,
        },
        createdAt: item.createdAt,
      };
    });
    return res.json({ data: formattedData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
