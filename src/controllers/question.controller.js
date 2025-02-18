const Test = require("../models/Test.js");
const Question = require("../models/Question.js");

exports.getAllQuestion = async (req, res) => {
  try {
    const questions = await Question.find();
    return res.json({ data: questions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const test = await Test.create({
      name: req.body.name,
      subject: req.body.subject,
      point: req.body.point,
    });
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
    const findTest = await Test.findById(req.params.id);

    const questions = await Question.find({ test: req.params.id });
    const correctAnswers = questions.reduce((acc, q) => {
      acc[q._id] = q.answers.filter((a) => a.isCorrect).map((a) => a.answer);
      return acc;
    }, {});
    const result = req.body.reduce((acc, answer) => {
      const correct = correctAnswers[answer.question].includes(answer.answer);
      acc[answer.question] = correct;
      return acc;
    }, {});

    const total = Object.keys(result).length;
    const correct = Object.values(result).filter(value => value).length;
    const percentage = (correct / total) * 100;

    return res.json({ 
      data: result,
      correctPercentage: percentage,
      point: percentage > 75 ? findTest.point : 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    if(req.body.questions) {
      for (const question of req.body.questions) {
        await Question.findByIdAndUpdate(question._id, question);
      }
    }
    return res.json({ data: test });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
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
