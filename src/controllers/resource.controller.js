const Resource = require("../models/Resource.js");

const getLanguageField = (lang) => {
  switch (lang) {
    case "uz":
      return "titleUz";
    case "ru":
      return "titleRu";
    case "en":
      return "titleEn";
    default:
      return null;
  }
};

const getSubjectTitle = (subject, lang) => {
  if (!subject) return null;
  switch (lang) {
    case "uz":
      return subject.titleUz;
    case "ru":
      return subject.titleRu;
    case "en":
      return subject.titleEn;
    default:
      return null;
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const { lang } = req.query;
    const fieldName = getLanguageField(lang);
    if (lang && !fieldName) {
      return res.status(400).json({ message: "Invalid language request" });
    }
    const resources = await Resource.find()
      .populate("teacher")
      .populate("subject")
      .sort({ createdAt: -1 });
    const result = resources.map((resource) => {
      return {
        _id: resource._id,
        titleUz: resource.titleUz,
        titleRu: resource.titleRu,
        titleEn: resource.titleEn,
        resources: resource.resources,
        teacher: resource.teacher,
        subject: getSubjectTitle(test.subject, lang),
        title: fieldName ? resource[fieldName] : undefined,
      };
    });
    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getResourcesByTeacher = async (req, res) => {
  try {
    const { lang } = req.query;
    const fieldName = getLanguageField(lang);
    if (lang && !fieldName) {
      return res.status(400).json({ message: "Invalid language request" });
    }
    const resources = await Resource.find({ teacher: req.params.id })
      .populate("subject")
      .populate("teacher")
      .sort({
        createdAt: -1,
      });
    const result = resources.map((resource) => {
      return {
        _id: resource._id,
        titleUz: resource.titleUz,
        titleRu: resource.titleRu,
        titleEn: resource.titleEn,
        resources: resource.resources,
        teacher: resource.teacher,
        subject: getSubjectTitle(test.subject, lang),
        title: fieldName ? resource[fieldName] : undefined,
      };
    });
    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const { lang } = req.query;
    const fieldName = getLanguageField(lang);
    if (lang && !fieldName) {
      return res.status(400).json({ message: "Invalid language request" });
    }
    const resource = await Resource.findById(req.params.id).populate("subject");
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    const result = {
      _id: resource._id,
      titleUz: resource.titleUz,
      titleRu: resource.titleRu,
      titleEn: resource.titleEn,
      resources: resource.resources,
      teacher: resource.teacher,
      subject: getSubjectTitle(test.subject, lang),
      title: fieldName ? resource[fieldName] : undefined,
    };
    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    const teacherId = req.teacher?.id;
    const adminId = req.admin?.id;
    if (!teacherId && !adminId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const resource = new Resource({
      ...req.body,
      teacher: teacherId,
      admin: adminId,
    });
    await resource.save();
    return res.status(201).json({ data: resource });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    return res.status(200).json({ data: resource });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    return res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
