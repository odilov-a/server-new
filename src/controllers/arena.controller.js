const Arena = require("../models/Arena.js");

const getLanguageField = (lang) => {
  switch (lang) {
    case "uz":
      return "titleUz";
    case "ru":
      return "titleRu";
    case "en":
      return "titleEn";
    default:
      return null;
  }
};

exports.getAllArena = async (req, res) => {
  try {
    const { lang } = req.query;
    const fieldName = getLanguageField(lang);
    if (lang && !fieldName) {
      return res.status(400).json({ message: "Invalid language request" });
    }
    const arena = await Arena.find().populate("groups", "name").populate({
      path: "problems",
      select: fieldName,
    });
    const result = arena.map((arena) => ({
      ...arena._doc,
      title: fieldName ? arena[fieldName] : undefined,
      problems: arena.problems.map((problem) => ({
        _id: problem._id,
        title: problem[fieldName],
      })),
    }));
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getArenaById = async (req, res) => {
  try {
    const { lang } = req.query;
    const fieldName = getLanguageField(lang);
    if (lang && !fieldName) {
      return res.status(400).json({ message: "Invalid language request" });
    }
    const arena = await Arena.findById(req.params.id);
    if (!arena) {
      return res.status(404).json({ message: "Arena not found" });
    }
    const result = {
      ...arena._doc,
      title: fieldName ? arena[fieldName] : undefined,
    };
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createArena = async (req, res) => {
  try {
    const { titleUz, titleRu, titleEn } = req.body;
    if (!titleUz || !titleRu || !titleEn) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const arena = await Arena.create({ ...req.body });
    return res.status(201).json({ data: arena });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateArena = async (req, res) => {
  try {
    const arena = await Arena.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!arena) {
      return res.status(404).json({ message: "Arena not found" });
    }
    return res.json({ data: arena });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteArena = async (req, res) => {
  try {
    const arena = await Arena.findByIdAndDelete(req.params.id);
    if (!arena) {
      return res.status(404).json({ message: "Arena not found" });
    }
    return res.json({ message: "Arena deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
