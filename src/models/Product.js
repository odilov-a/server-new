const { Schema, model } = require("mongoose");
const productSchema = new Schema(
  {
    nameUz: {
      type: String,
      required: true,
    },
    nameRu: {
      type: String,
      required: true,
    },
    nameEn: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    descriptionUz: {
      type: String,
      required: true,
    },
    descriptionRu: {
      type: String,
      required: true,
    },
    descriptionEn: {
      type: String,
      required: true,
    },
    photoUrl: [
      {
        type: String,
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

const product = model("Product", productSchema);
module.exports = product;
