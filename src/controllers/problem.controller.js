const mongoose = require("mongoose");
const Problem = require("../models/Problem.js");

const getLanguageField = (lang, type) => {
  const fields = {
    title: { uz: "titleUz", ru: "titleRu", en: "titleEn" },
    description: {
      uz: "descriptionUz",
      ru: "descriptionRu",
      en: "descriptionEn",
    },
  };
  return fields[type]?.[lang];
};

const formatProblem = (problem, lang) => {
  const titleField = getLanguageField(lang, "title");
  const descriptionField = getLanguageField(lang, "description");
  return {
    _id: problem._id,
    title: problem[titleField],
    titleEn: problem.titleEn,
    titleRu: problem.titleRu,
    titleUz: problem.titleUz,
    description: problem[descriptionField],
    descriptionEn: problem.descriptionEn,
    descriptionRu: problem.descriptionRu,
    descriptionUz: problem.descriptionUz,
    point: problem.point,
    tutorials: problem.tutorials,
    testCases: problem.testCases,
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
    subject: {
      _id: problem.subject?._id,
      title: problem.subject?.[titleField],
    },
    difficulty: {
      _id: problem.difficulty?._id,
      title: problem.difficulty?.[titleField],
    },
    arena: {
      _id: problem.arena?._id,
      title: problem.arena?.[titleField],
    },
  };
};

exports.getAllProblems = async (req, res) => {
  try {
    const { lang } = req.query;
    const problems = await Problem.find()
      .populate("subject difficulty")
      .lean();
    const result = problems.map((problem) => formatProblem(problem, lang));
    return res.json({ data: result.reverse() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate("subject difficulty")
      .lean();
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    return res.json({ data: formatProblem(problem, req.query.lang) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllProblemsByTeacher = async (req, res) => {
  try {
    const teacherId = req.teacher?.id;
    if (!teacherId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const { lang } = req.query;
    const problems = await Problem.find({ teacher: teacherId })
      .populate("subject difficulty")
      .lean();
    const result = problems.map((problem) => formatProblem(problem, lang));
    return res.json({ data: result.reverse() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllProblemsByDifficulty = async (req, res) => {
  try {
    const { lang } = req.query;
    const problems = await Problem.find({ difficulty: req.params.difficulty })
      .populate("subject difficulty")
      .lean();
    const result = problems.map((problem) => formatProblem(problem, lang));
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getProblemsBySubject = async (req, res) => {
  try {
    const { lang } = req.query;
    const problems = await Problem.find({ subject: req.params.subject })
      .populate("subject difficulty")
      .lean();
    const result = problems.map((problem) => formatProblem(problem, lang));
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.searchProblems = async (req, res) => {
  try {
    const { search, lang } = req.query;
    const regex = new RegExp(decodeURIComponent(search), "i");
    const problems = await Problem.find({
      $or: [
        { titleUz: regex },
        { descriptionUz: regex },
        { titleRu: regex },
        { descriptionRu: regex },
        { titleEn: regex },
        { descriptionEn: regex },
      ],
    })
      .populate("subject difficulty")
      .lean();
    const result = problems.map((problem) => formatProblem(problem, lang));
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const teacherId = req.teacher?.id;
    const adminId = req.admin?.id;
    if (!teacherId && !adminId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const subjectId = req.body.subject?._id || req.body.subject?.value;
    const difficultyId = req.body.difficulty?._id || req.body.difficulty?.value;
    if (
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(difficultyId)
    ) {
      return res.status(400).json({ message: "wrong id" });
    }
    const newProblem = new Problem({
      titleUz: req.body.titleUz,
      titleRu: req.body.titleRu,
      titleEn: req.body.titleEn,
      descriptionUz: req.body.descriptionUz,
      descriptionRu: req.body.descriptionRu,
      descriptionEn: req.body.descriptionEn,
      point: Number(req.body.point),
      tutorials: req.body.tutorials,
      testCases: req.body.testCases,
      timeLimit: Number(req.body.timeLimit),
      memoryLimit: Number(req.body.memoryLimit),
      subject: subjectId,
      difficulty: difficultyId,
      teacher: teacherId,
      admin: adminId,
    });
    await newProblem.save();
    return res.status(201).json({ data: newProblem });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    return res.status(200).json({ data: problem });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    return res.json({ data: problem });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
