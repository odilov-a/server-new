const { model, Schema } = require('mongoose');

const questionSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  answers: [{
    answer: String,
    isCorrect: {
      type: Boolean,
      default: false,
    }
  }],
  test: {
    type: Schema.Types.ObjectId,
    ref: 'Test',
  }
});

const Question = model('Question', questionSchema);

module.exports = Question;
