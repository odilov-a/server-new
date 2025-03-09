const Test = require("../models/Test.js");
const Student = require("../models/Student.js");
const Passed = require("../models/Passed.js");
const Question = require("../models/Question.js");

const getLanguageField = (lang) => {
  const fields = {
    uz: "nameUz",
    ru: "nameRu",
    en: "nameEn",
  };
  return fields[lang] || null;
};

exports.getAllTest = async (req, res) => {
  try {
    const { lang } = req.query;
    const fieldName = getLanguageField(lang);
    const tests = await Test.find(req.query.filter).populate("subject").lean();
    const result = tests.map((test) => ({
      _id: test._id,
      name: fieldName ? test[fieldName] : test.nameEn,
      point: test.point,
      subject: test.subject
        ? test.subject[fieldName.replace("name", "title")] ||
          test.subject.titleEn
        : "Unknown",
    }));
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getTestQuestions = async (req, res) => {
  try {
    const { lang } = req.query;
    const findTest = await Test.findById(req.params.id)
      .populate("subject")
      .lean();
    if (!findTest) return res.status(404).json({ message: "Test not found" });
    const questions = await Question.find({ test: req.params.id }).lean();
    const getLocalizedField = (obj, field) => {
      if (lang && ["uz", "ru", "en"].includes(lang)) {
        const localizedField = `${field}${lang.charAt(0).toUpperCase()}${lang
          .slice(1)
          .toLowerCase()}`;
        return obj[localizedField] || obj[`${field}Uz`];
      }
      return obj[`${field}Uz`];
    };
    const localizedTest = {
      _id: findTest._id,
      nameUz: findTest.nameUz,
      nameRu: findTest.nameRu,
      nameEn: findTest.nameEn,
      name: getLocalizedField(findTest, "name"),
      subject: {
        _id: findTest.subject._id,
        titleUz: findTest.subject.titleUz,
        titleRu: findTest.subject.titleRu,
        titleEn: findTest.subject.titleEn,
        title: getLocalizedField(findTest.subject, "title"),
      },
      point: findTest.point,
      admin: findTest.admin,
      createdAt: findTest.createdAt,
      questions: questions.map((q) => ({
        _id: q._id,
        titleUz: q.titleUz,
        titleRu: q.titleRu,
        titleEn: q.titleEn,
        title: getLocalizedField(q, "title"),
        type: q.type,
        photoUrl: q.photoUrl,
        answers: q.answers.map((a) => ({
          _id: a._id,
          answerUz: a.answerUz,
          answerRu: a.answerRu,
          answerEn: a.answerEn,
          answer: getLocalizedField(a, "answer"),
          isCorrect: a.isCorrect,
        })),
      })),
    };
    return res.json({ data: localizedTest });
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
    const test = await Test.create(req.body);
    if (req.body.questions && req.body.questions.length > 0) {
      await Question.insertMany(
        req.body.questions.map((q) => ({ ...q, test: test._id }))
      );
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.checkAnswers = async (req, res) => {
  try {
    const findTest = await Test.findById(req.params.id);
    if (!findTest) return res.status(404).json({ message: "Test not found" });
    const findStudent = await Student.findById(req.userId);
    if (!findStudent)
      return res.status(404).json({ message: "Student not found" });
    const questions = await Question.find({ test: req.params.id });
    let correctAnswers = 0;
    let totalTestQuestions = questions.length;
    const studentAnswers = req.body.answers
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
          isCorrect =
            correctAnswer &&
            selectedAnswer &&
            correctAnswer._id.toString() === selectedAnswer._id.toString();
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
    const percentage = (correctAnswers / totalTestQuestions) * 100;
    let earnedPoints = 0;
    if (percentage >= 75) {
      findStudent.balance += findTest.point;
      await findStudent.save();
      earnedPoints = findTest.point;
    }
    const passedTest = await Passed.create({
      student: req.userId,
      test: req.params.id,
      answers: studentAnswers,
    });
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
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!test) return res.status(404).json({ message: "Test not found" });
    if (req.body.questions) {
      for (const question of req.body.questions) {
        await Question.findByIdAndUpdate(question._id, question, { new: true });
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
    if (!test) return res.status(404).json({ message: "Test not found" });
    await Question.deleteMany({ test: test._id });
    return res.json({ message: "Successfully deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
