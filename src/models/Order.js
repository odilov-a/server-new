const { Schema, Types, model } = require("mongoose");
const orderSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
});

const Order = model("Order", orderSchema);
module.exports = Order;
