const { Schema, Types, model } = require("mongoose");
const resultSchema = new Schema(
  {
    arena: {
      type: Types.ObjectId,
      ref: "Arena",
      required: true,
    },
    group: {
      type: Types.ObjectId,
      ref: "Group",
      required: true,
    },
    problem: {
      type: Types.ObjectId,
      ref: "problems",
      required: true,
    },
    solved: {
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

const Result = model("Result", resultSchema);
module.exports = Result;
