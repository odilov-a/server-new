const { model, Schema, Types } = require("mongoose");
const testSchema = new Schema(
  {
    nameUz: {
      type: String,
    },
    nameRu: {
      type: String,
    },
    nameEn: {
      type: String,
    },
    subject: {
      ref: "subjects",
      type: Types.ObjectId,
    },
    point: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    teacher: {
      type: Types.ObjectId,
      ref: "teacher",
    },
    admin: {
      type: Types.ObjectId,
      ref: "admin",
    },
  },
  {
    versionKey: false,
  }
);

const Test = model("nameTest", testSchema);
module.exports = Test;
