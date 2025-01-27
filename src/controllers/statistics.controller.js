const Attempt = require("../models/Attempt.js");
const Student = require("../models/Student.js");

exports.countStudents = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    return res.status(200).json({ data: studentCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.languageDistribution = async (req, res) => {
  try {
    const languageCounts = await Attempt.aggregate([
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
    return res.status(200).json({ data: languageCounts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
