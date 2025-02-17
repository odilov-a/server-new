const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const Test = require("../models/Test.js");
const Question = require("../models/Question.js");

exports.getAll = async (req, res) => {
  try {
    const tests = await Question.find();
    return res.json({ data: tests });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createWithFolder = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../uploads", req.body.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: "Fayl topilmadi" });
    }
    const data = await fs.promises.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: data });
    const lines = result.value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    let questions = [];
    let currentQuestion = null;
    lines.forEach((line) => {
      if (line.startsWith("? ")) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          title: line.slice(2).trim(),
          answers: [],
        };
      } else if (line.startsWith("@ ")) {
        if (currentQuestion) {
          currentQuestion.answers.push({
            answer: line.slice(2).trim(),
            isCorrect: true,
          });
        }
      } else if (line.startsWith("! ")) {
        if (currentQuestion) {
          currentQuestion.answers.push({
            answer: line.slice(2).trim(),
            isCorrect: false,
          });
        }
      }
    });
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    const test = await Test.create({
      name: lines[0],
      subject: req.body.subject,
    });
    const savedQuestions = await Question.insertMany(
      questions.map((q) => ({ ...q, test: test._id }))
    );
    return res.json({
      message: `${savedQuestions.length} ta savol saqlandi`,
      test,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const test = await Test.create({
      name: req.body.name,
      subject: req.body.subject,
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
    const questions = await Question.find({ test: req.params.id });
    const correctAnswers = questions.reduce((acc, q) => {
      acc[q._id] = q.answers.filter((a) => a.isCorrect).map((a) => a.answer);
      return acc;
    }, {});
    const result = req.body.reduce((acc, answer) => {
      const correct = correctAnswers[answer.question].includes(answer.answer);
      acc[answer.question] = correct;
      acc.correct = correctAnswers[answer.question][0];
      return acc;
    }, {});
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
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
