const { model, Schema, Types } = require("mongoose");
const questionSchema = new Schema(
  {
    titleUz: {
      type: String,
      required: true,
    },
    titleRu: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
      required: true,
    },
    type: {
      type: Number,
    },
    photoUrl: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    answers: [
      {
        answerUz: String,
        answerRu: String,
        answerEn: String,
        isCorrect: {
          type: Boolean,
        },
      },
    ],
    test: {
      type: Types.ObjectId,
      ref: "NameTest",
    },
  },
  {
    versionKey: false,
  }
);

const Question = model("Question", questionSchema);
module.exports = Question;
