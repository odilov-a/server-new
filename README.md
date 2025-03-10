!readme
in production mode : python to python3

```javascipt
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
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
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
```
