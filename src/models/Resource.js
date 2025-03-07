const { Schema, Types, model } = require("mongoose");
const resourceSchema = new Schema(
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
    resources: [
      {
        type: String,
        required: true,
      },
    ],
    teacher: {
      type: Types.ObjectId,
      ref: "teachers",
      index: true,
    },
    admin: {
      type: Types.ObjectId,
      ref: "admins",
      index: true,
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

const Resource = model("Resource", resourceSchema);
module.exports = Resource;
