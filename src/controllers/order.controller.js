const Order = require('../models/order');
const User = require('../models/student');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('products.product').populate('user');
    res.status(200).json({
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.createOrder = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { total, products } = req.body;
    
    const findStudent = await User.findById(studentId);

    if (!findStudent) {
      return res.status(404).json({ message: 'User not found' });
    }

    if(findStudent.balance < total){
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    findStudent.balance -= total;
    await findStudent.save();

    const newOrder = new Order({
      user: studentId,
      total,
      products,
    });

    const order = await newOrder.save();
    res.status(201).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const studentId = req.student.id;
    const findStudent = await User.findById(studentId);

    if (!findStudent) {
      return res.status(404).json({ message: 'User not found' });
    }

    findStudent.balance += order.total;
    await findStudent.save();

    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}