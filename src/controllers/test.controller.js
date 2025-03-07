const Test = require("../models/Test.js");
const User = require("../models/Student.js");
const Passed = require("../models/Passed.js");
const Question = require("../models/Question.js");

const getLanguageField = (lang) => {
  switch (lang) {
    case "uz":
      return "nameUz";
    case "ru":
      return "nameRu";
    case "en":
      return "nameEn";
    default:
      return null;
  }
};

const getSubjectTitle = (subject, lang) => {
  if (!subject) return null;
  switch (lang) {
    case "uz":
      return subject.titleUz;
    case "ru":
      return subject.titleRu;
    case "en":
      return subject.titleEn;
    default:
      return null;
  }
};

exports.getAllTest = async (req, res) => {
  try {
    const { lang } = req.query;
    const fieldName = getLanguageField(lang);
    if (lang && !fieldName) {
      return res.status(400).json({ message: "Invalid language request" });
    }
    const tests = await Test.find(req.query.filter || {})
      .populate("subject")
      .lean();
    const result = tests.map((test) => {
      return {
        _id: test._id,
        nameUz: test.nameUz,
        nameRu: test.nameRu,
        nameEn: test.nameEn,
        name: fieldName ? test[fieldName] : undefined,
        point: test.point,
        subject: getSubjectTitle(test.subject, lang),
      };
    });
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getTestQuestions = async (req, res) => {
  try {
    const findTest = await Test.findById(req.params.id)
      .lean()
      .populate("subject");
    if (!findTest) return res.status(404).json({ message: "Test not found" });
    const questions = await Question.find({ test: req.params.id });
    findTest.questions = questions;
    return res.json({ data: findTest });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createTest = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    const teacherId = req.teacher?.id;

    if (adminId) req.body.admin = adminId;
    if (teacherId) req.body.teacher = teacherId;

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
    let totalTestQuestions = 0;

    const userAnswers = req.body.answers
      .map((answer) => {
        const question = questions.find(
          (q) => q._id.toString() === answer.question
        );
        if (!question) return null;

        let isCorrect = false;
        let correctAnswer = null;
        let selectedAnswer = null;
        let description = null;

        if (question.type === 1) {
          correctAnswer = question.answers.find((i) => i.isCorrect);
          selectedAnswer = question.answers.find(
            (i) => i._id.toString() === answer.answer
          );

          isCorrect = correctAnswer._id === selectedAnswer._id;
          totalTestQuestions++;
        } else if (question.type === 2) {
          description = answer.answer?.trim() || "";
        }

        if (isCorrect) correctAnswers++;

        return {
          question: question._id,
          selectedAnswer: question.type === 1 ? selectedAnswer : null,
          correctAnswer: question.type === 1 ? correctAnswer : null,
          description,
        };
      })
      .filter((ans) => ans !== null);

    const percentage =
      totalTestQuestions > 0 ? (correctAnswers / totalTestQuestions) * 100 : 0;
    let earnedPoints = 0;

    if (percentage >= 75) {
      const findTest = await Test.findById(req.params.id);
      const findUser = await User.findById(req.userId);
      findUser.balance += findTest.point;
      await findUser.save();
      earnedPoints = findTest.point;
    }

    const passedTest = new Passed({
      user: req.userId,
      test: req.params.id,
      answers: userAnswers,
    });
    await passedTest.save();

    return res.json({
      message:
        percentage >= 75
          ? "Congratulations! You passed the test"
          : "Sorry! You failed the test",
      percentage,
      correctAnswers,
      totalQuestions: totalTestQuestions,
      earnedPoints,
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
        await Question.findByIdAndUpdate(question._id, { ...question });
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
