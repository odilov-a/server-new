const { Schema, Types, model } = require("mongoose");

const passedSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: "students",
      required: true,
    },
    admin: {
      type: Types.ObjectId,
      ref: "admins",
    },
    teacher: {
      type: Types.ObjectId,
      ref: "teachers",
    },
    test: {
      type: Types.ObjectId,
      ref: "nameTest",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    answers: [
      {
        question: {
          type: Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswer: {
          type: Object,
        },
        correctAnswer: {
          type: Object,
        },
        description: {
          type: String,
        },
        status: {
          type: String,
          enum: ["pending", "checked"],
          default: "pending",
        },
      },
    ],
  },
  {
    versionKey: false,
  }
);

const Passed = model("Passed", passedSchema);
module.exports = Passed;
