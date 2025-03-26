const Group = require("../models/Group.js");

exports.getAll = async (req, res) => {
  try {
    const groups = await Group.find();
    return res.json({ data: groups });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.json({ data: group });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const group = await Group.create(req.body);
    return res.status(201).json({ data: group });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.json({ data: group });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.json({ data: group });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};