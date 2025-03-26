const { Schema, Types, model } = require("mongoose");
const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    players: [
      {
        type: Types.ObjectId,
        ref: "students",
      },
    ],
    leader: {
      type: Types.ObjectId,
      ref: "students",
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

const Group = model("Group", groupSchema);
module.exports = Group;
