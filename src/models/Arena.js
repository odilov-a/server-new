const { Schema, model, Types } = require("mongoose");
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
    groups: [
      {
        type: Types.ObjectId,
        ref: "groups",
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

const Arena = model("Arena", arenaSchema);
module.exports = Arena;
