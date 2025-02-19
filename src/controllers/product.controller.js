const Product = require('../models/product');

exports.getAll = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      data: products,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

exports.create = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      data: product,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      data: product,
    });
  }
  catch (error) {
    res.status(500).send({ message: error.message });
  }
}

exports.delete = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}