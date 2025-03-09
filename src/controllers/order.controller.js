const Order = require("../models/Order.js");
const Student = require("../models/Student.js");

exports.getAllOrders = async (req, res) => {
  try {
    const { lang } = req.query;
    const nameField =
      lang === "uz" ? "nameUz" : lang === "ru" ? "nameRu" : "nameEn";
    const orders = await Order.find()
      .populate({ path: "product", select: `${nameField} photoUrl` })
      .populate({ path: "student", select: "username phoneNumber" });
    const transformedOrders = orders.map((order) => ({
      _id: order._id,
      student: order.student,
      product: {
        _id: order.product._id,
        name: order.product[nameField],
        photoUrl: order.product.photoUrl,
      },
      total: order.total,
      createdAt: order.createdAt,
    }));
    return res.status(200).json({ data: transformedOrders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const studentId = req.userId;
    const { total, product } = req.body;
    const findStudent = await Student.findById(studentId);
    if (!findStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (findStudent.balance < total) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    findStudent.balance -= total;
    await findStudent.save();
    const newOrder = new Order({
      student: studentId,
      total,
      product,
    });
    const order = await newOrder.save();
    return res.status(201).json({ data: order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const student = await Student.findById(order.student);
    if (!student) {
      return res.status(404).json({ message: "Order owner not found" });
    }
    student.balance += order.total;
    await student.save();
    await Order.findByIdAndDelete(orderId);
    return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
