!readme
python to python3

```javascipt
exports.registerStudent = async (req, res) => {
  try {
    const { password, ...otherData } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const student = new Student({
      ...otherData,
      password: hashedPassword,
    });
    await student.save();
    const token = sign({
      id: student._id,
      role: student.role,
      username: student.username,
      createdAt: student.createdAt,
    });
    return res.status(201).json({
      data: {
        token,
        student,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```