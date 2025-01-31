const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { sign } = require("../utils/jwt.js");
const Student = require("../models/Student.js");
const Attempt = require("../models/Attempt.js");

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select(
      "balance firstName isActive lastName phoneNumber photoUrl username lastLogin email"
    );
    return res.json({ data: students });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAttemptByStudentId = async (req, res) => {
  try {
    const attempts = await Attempt.find({ studentId: req.params.id }).select(
      "-password"
    );
    return res.json({ data: attempts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllStudentsHistory = async (req, res) => {
  try {
    const attempts = await Attempt.find().populate({
      path: "studentId",
      model: "students",
      select: "-password -photoUrl -role -createdAt -_id -history",
      strictPopulate: false,
    });
    const result = attempts.reverse();
    return res.json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMeStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.isActive === false) {
      return res.status(401).json({ message: "Account is not active" });
    }
    student.lastLogin = new Date();
    await student.save();
    return res.status(200).json({
      data: {
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName,
        balance: student.balance,
        phoneNumber: student.phoneNumber,
        photoUrl: student.photoUrl,
        isActive: student.isActive,
        email: student.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.json({ data: student });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getTopStudentsByBalance = async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ balance: -1 })
      .select("balance firstName lastName username");
    return res.json({ data: students });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.searchStudentByFirstNameLastName = async (req, res) => {
  try {
    const students = await Student.find({
      $or: [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
      ],
    }).select("firstName lastName username isActive lastLogin photoUrl");
    return res.json({ data: students });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const username = `${firstName}${lastName}`
      .toLowerCase()
      .replace(/\s+/g, "")
      .concat(Math.floor(Math.random() * 10000));
    const password = Math.random().toString(36).slice(-12);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const student = new Student({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
    });
    await student.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: '"UzContest" <akbarjonodilov03@gmail.com>',
      to: email,
      subject: "UzContest platformasiga muvaffaqiyatli ro'yxatdan o'tdingiz!",
      text: `Hurmatli ${firstName},\n\nUzContest platformasidan muvaffaqiyatli ro'yxatdan o'tganingiz bilan tabriklaymiz! \n\nShaxsiy login ma'lumotlaringiz:\n- Username: ${username}\n- Parol: ${password}\n\nIltimos, ushbu ma'lumotlarni xavfsiz joyda saqlang va begonalarga oshkor qilmang va xavfsizlik uchun profilingiz ma'lumotlarini o'zgartirib oling!\n\nHar qanday savol yoki tushunmovchilik yuzasidan biz bilan bog'lanishdan tortinmang.\n\nHurmat bilan,\nUzContest jamoasi`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(201).json({
      message: "Student registered successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.adminRegisterStudent = async (req, res) => {
  try {
    const { firstName, lastName, username, password, isActive } = req.body;
    const existingStudent = await Student.findOne({ username });
    if (existingStudent) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const student = new Student({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });
    await student.save();
    return res.status(201).json({ data: student });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;
    const student = await Student.findOne({ username });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.isActive === false) {
      return res.status(401).json({ message: "Account is not active" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, student.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    student.lastLogin = new Date();
    await student.save();
    const token = sign({
      id: student._id,
      role: student.role,
      username: student.username,
      createdAt: student.createdAt,
    });
    return res.status(200).json({
      data: {
        token,
        role: student.role,
        username: student.username,
        isActive: student.isActive,
        lastLogin: student.lastLogin,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.meUpdateStudent = async (req, res) => {
  try {
    const { userId } = req;
    const { password, ...otherData } = req.body;
    let updateData = { ...otherData };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }
    const student = await Student.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password -role -createdAt -_id -history -lastLogin");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.json({ data: student });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { password, ...otherData } = req.body;
    let updateData = { ...otherData };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }
    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.json({ data: student });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.json({ data: student });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
