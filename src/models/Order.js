const { Schema, Types, model } = require("mongoose");
const orderSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: "students",
      required: true,
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    total: {
      type: Number,
      required: true,
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

const Order = model("Order", orderSchema);
module.exports = Order;
