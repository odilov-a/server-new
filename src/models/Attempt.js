const { Schema, Types, model } = require("mongoose");
const AttemptSchema = new Schema(
  {
    studentId: {
      type: Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    problemId: {
      type: Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    timeLimit: {
      type: Number,
    },
    memoryLimit: {
      type: Number,
    },
    failedTestCaseIndex: {
      type: Number,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

const Attempt = model("Attempt", AttemptSchema);
module.exports = Attempt;
