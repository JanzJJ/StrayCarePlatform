const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/auth");

// ── Cloudinary uploader (replaces local multer diskStorage) ────────────────
const { uploadReport } = require("../config/cloudinary");

// ─── PROTECTED ROUTES ───────────────────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  uploadReport.array("media", 5),
  reportController.createReport
);

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────
router.get("/summary", reportController.getSummaryCounts);
router.get("/", reportController.getAllReports);

// ─── PROTECTED ROUTES ───────────────────────────────────────────────────────
router.put("/:reportId/status", authMiddleware, reportController.updateStatus);

module.exports = router;