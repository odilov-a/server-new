const { Schema, Types, model } = require("mongoose");
const FeedbackSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: "Student",
      index: true,
    },
    teacher: {
      type: Types.ObjectId,
      ref: "Teacher",
      index: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Feedback = model("Feedback", FeedbackSchema);
module.exports = Feedback;
