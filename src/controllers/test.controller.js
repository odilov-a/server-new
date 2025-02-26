const Test = require("../models/Test.js");
const User = require("../models/Student.js");
const Question = require("../models/Question.js");

exports.getAllTest = async (req, res) => {
  try {
    const tests = await Test.find(req.query.filter || {});
    return res.json({ data: tests });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

exports.getTestQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ test: req.params.id });
    return res.json({ data: questions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

exports.createTest = async (req, res) => {
  try {
    const test = await Test.create({ ...req.body });
    await Question.insertMany(
      req.body.questions.map((q) => ({ ...q, test: test._id }))
    );
    return res.json({ data: test });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.checkAnswers = async (req, res) => {
  try {
    const questions = await Question.find({ test: req.params.id });

    let correctAnswers = 0;

    for (answer of req.body.answers) {
      const correctAnswer = questions.find(q => q._id == answer.question).answers.find(i => i.isCorrect == true)._id.toString();
      if (correctAnswer == answer.answer) correctAnswers++;
    }

    const percentage = correctAnswers / questions.length * 100;

    if (percentage > 75) {
      const findTest = await Test.findById(req.params.id);
      const findUser = await User.findById(req.userId);
      findUser.balance += findTest.point;
    }

    return res.json({
      message: percentage >= 75 ? "Congratulations! You passed the test" : "Sorry! You failed the test",
      percentage,
      correctAnswers,
      totalQuestions: questions.length,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    if (req.body.questions) {
      for (const question of req.body.questions) {
        await Question.findByIdAndUpdate(question._id, question);
      }
    }
    return res.json({ data: test });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (test) {
      await Question.deleteMany({ test: test._id });
      return res.json({ message: "Successfully deleted" });
    } else {
      return res.status(404).json({ message: "Test not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
