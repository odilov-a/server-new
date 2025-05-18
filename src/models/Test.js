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
      ref: "Subject",
      type: Types.ObjectId,
      required: true,
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
      ref: "Teacher",
    },
    admin: {
      type: Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    versionKey: false,
  }
);

const Test = model("NameTest", testSchema);
module.exports = Test;
