const Result = require("../models/Result");

exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find().populate("arena group problem");
    return res.json({ data: results });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getByIdResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate(
      "arena group problem"
    );
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);
    return res.status(201).json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
