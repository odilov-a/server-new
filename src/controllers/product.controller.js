const Product = require("../models/Product.js");

const getLanguageField = (lang, type) => {
  const fields = {
    name: { uz: "nameUz", ru: "nameRu", en: "nameEn" },
    description: {
      uz: "descriptionUz",
      ru: "descriptionRu",
      en: "descriptionEn",
    },
  };
  return fields[type]?.[lang] || null;
};

const formatProblem = (problem, lang) => {
  const nameField = getLanguageField(lang, "name") || "nameEn";
  const descriptionField =
    getLanguageField(lang, "description") || "descriptionEn";
  return {
    _id: problem._id,
    name: problem[nameField],
    nameEn: problem.nameEn,
    nameRu: problem.nameRu,
    nameUz: problem.nameUz,
    description: problem[descriptionField],
    descriptionEn: problem.descriptionEn,
    descriptionRu: problem.descriptionRu,
    descriptionUz: problem.descriptionUz,
    price: problem.price,
    photoUrl: problem.photoUrl,
  };
};

exports.getAll = async (req, res) => {
  try {
    const { lang } = req.query;
    const products = await Product.find();
    const result = products.map((product) => formatProblem(product, lang));
    return res.json({ data: result.reverse() });
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
