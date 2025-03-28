const Passed = require("../models/Passed.js");

exports.getAllPassed = async (req, res) => {
  try {
    const passed = await Passed.find()
      .populate("student", "firstName lastName")
      .populate("test", "nameUz");
    const transformedData = passed.map((item) => {
      const totalQuestions = item.answers.length;
      const correctAnswers = item.answers.filter(
        (answer) => answer.selectedAnswer.isCorrect
      ).length;
      const incorrectAnswers = totalQuestions - correctAnswers;
      return {
        id: item._id,
        student: {
          name: item.student
            ? `${item.student.firstName} ${item.student.lastName}`
            : "Unknown Student",
        },
        test: {
          name: item.test ? item.test.nameUz : "Unknown Test",
        },
        stats: {
          totalQuestions,
          correctAnswers,
          incorrectAnswers,
        },
        createdAt: item.createdAt,
      };
    });
    return res.status(200).json({data: transformedData});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
