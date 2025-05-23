const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const Files = require("../models/File.js");

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png"];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only .jpg, .jpeg, and .png are allowed."),
      false
    );
  }
};

exports.upload = async (req, res) => {
  try {
    const publicFolderPath = `./uploads`;
    const storage = multer.diskStorage({
      destination: publicFolderPath,
      filename: (req, file, cb) => {
        const fileId = new mongoose.Types.ObjectId().toString();
        const fileExtension = path.extname(file.originalname);
        const fileName = `${fileId}${fileExtension}`;
        cb(null, fileName);
      },
    });

    const upload = multer({
      storage,
      fileFilter,
    }).single("file");

    upload(req, res, async (error) => {
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      if (!req.file) {
        return res.status(400).json({ message: "File not found" });
      }
      const newFile = new Files({
        fileName: req.file.filename,
        fileUrl: `${process.env.FILE_UPLOAD_GET_URL}/uploads/${req.file.filename}`,
      });
      await newFile.save();
      return res.status(200).json({ data: newFile });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
