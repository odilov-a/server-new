const Product = require("../models/Product.js");

exports.getAll = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ data: products });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ data: product });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    return res.status(201).json({ data: product });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ data: product });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(204).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
