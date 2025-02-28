const { Schema, Types, model } = require("mongoose");

const passedSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "user"
  },
  admin: {
    type: Types.ObjectId,
    ref: "admin"
  },
  teacher: {
    type: Types.ObjectId,
    ref: "teacher"
  },
  test: {
    type: Types.ObjectId,
    ref: "nameTest"
  },
  answers: [{
    question: {
      type: Types.ObjectId,
      ref: "Question"
    },
    selectedAnswer: {
      type: Object
    },
    correctAnswer: {
      type: Object
    },
    description: {
      type: String,
    }
  }]
});

const Passed = model("Passed", passedSchema);
module.exports = Passed;
