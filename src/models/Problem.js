const { Schema, Types, model } = require("mongoose");
const problemSchema = new Schema(
  {
    titleUz: {
      type: String,
      required: true,
    },
    descriptionUz: {
      type: String,
      required: true,
    },
    titleRu: {
      type: String,
      required: true,
    },
    descriptionRu: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
      required: true,
    },
    descriptionEn: {
      type: String,
      required: true,
    },
    point: {
      type: Number,
      required: true,
    },
    tutorials: {
      type: String,
      required: true,
    },
    testCases: [
      {
        inputFileUrl: {
          type: String,
          required: true,
        },
        outputFileUrl: {
          type: String,
          required: true,
        },
      },
    ],
    timeLimit: {
      type: Number,
      required: true,
    },
    memoryLimit: {
      type: Number,
      required: true,
    },
    subject: {
      type: Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    difficulty: {
      type: Types.ObjectId,
      ref: "Difficulty",
      required: true,
      index: true,
    },
    teacher: {
      type: Types.ObjectId,
      ref: "Teacher",
      index: true,
    },
    admin: {
      type: Types.ObjectId,
      ref: "Admin",
      index: true,
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

const Problem = model("Problem", problemSchema);
module.exports = Problem;
