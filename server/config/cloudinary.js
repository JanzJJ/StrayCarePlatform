// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage for adoption photos (images only) ──────────────────────────────
const adoptionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "straycare/adoptions",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
    transformation: [{ width: 1200, crop: "limit" }], // Resize large images
  },
});

// ── Storage for report media (images + videos) ─────────────────────────────
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "straycare/reports",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "mov", "avi"]
        : ["jpg", "jpeg", "png", "webp"],
    };
  },
});

// File filter for adoption (images only)
const adoptionFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload image files only."), false);
  }
};

// File filter for reports (images + videos)
const reportFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file format. Please upload images or videos only."),
      false
    );
  }
};

const uploadAdoption = multer({
  storage: adoptionStorage,
  fileFilter: adoptionFileFilter,
  limits: { files: 3 },
});

const uploadReport = multer({
  storage: reportStorage,
  fileFilter: reportFileFilter,
  limits: { files: 5 },
});

module.exports = { cloudinary, uploadAdoption, uploadReport };
