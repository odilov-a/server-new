const { Schema, Schema, model } = require("mongoose");
const arenaSchema = new Schema(
  {
    titleUz: {
      type: String,
      required: true,
      uniqe: true,
    },
    titleRu: {
      type: String,
      required: true,
      uniqe: true,
    },
    titleEn: {
      type: String,
      required: true,
      uniqe: true,
    },
    problems: [
      {
        type: Types.ObjectId,
        ref: "problems",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Arena = model("arena", arenaSchema);
module.exports = Arena;
