const Passed = require("../models/Passed");

exports.getAll = async (req, res) => {
  try {
    const data = await Passed.find()
    return res.json({
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}

exports.delete = async (req, res) => {
  try {
    await Passed.findByIdAndDelete(req.params.id)
    return res.json({
      message: "Result deleted successfully"
    })
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}
