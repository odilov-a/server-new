const { Schema, model } = require("mongoose");
const translationSchema = new Schema(
  {
    message: {
      type: String,
    },
    uz: {
      type: String,
    },
    ru: {
      type: String,
    },
    en: {
      type: String,
    },
  },
  {
    versionKey: false,
  }
);

const Translation = model("Translation", translationSchema);
module.exports = Translation;
