const { Schema, Types, model } = require("mongoose");
const studentSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: [true, "Username already exists"],
    },
    email: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    phoneNumber: {
      type: String,
    },
    photoUrl: [
      {
        type: String,
      },
    ],
    history: [
      {
        type: Types.ObjectId,
        ref: "problems",
        index: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "student",
      required: true,
    },
    lastLogin: {
      type: Date,
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

const Student = model("students", studentSchema);
module.exports = Student;
