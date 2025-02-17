const { model, Schema, Types } = require('mongoose');

const testSchema = new Schema({
  name: {
    type: String,
  },
  subject: {
    ref: 'Subject',
    type: Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Test = model('Test', testSchema);

module.exports = Test;
