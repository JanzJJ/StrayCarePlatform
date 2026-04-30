/**
 
 * STRAY DOG REPORTS ROUTES
 *
 * 
 * Endpoints for reporting and managing stray dog cases
 * 
 * Features:
 * - Submit stray dog reports with photos/videos
 * - Track dog status from report through rescue/adoption
 * - Display dogs on interactive map with color-coded pins
 * - Update dog status as situation resolves
 * - Send urgent alerts to welfare organizations
 
 * 
 * File Upload:
 * - Maximum 5 files per report
 * - Maximum 1 video per report
 * - Images and videos allowed
 * - Files stored in uploads/ directory
 */

const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");

// ─── FILE UPLOAD CONFIGURATION ──────────────────────────────────────────────
// Configure multer for disk storage of report media
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // All report media stored in uploads/ directory
    // Ensure you create an 'uploads' folder in your backend root
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Generate unique filename: "<timestamp>-<originalname>"
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File filter: Only allow images and videos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true); // Accept image or video files
  } else {
    cb(
      new Error("Invalid file format. Please upload images or videos only."),
      false,
    );
  }
};

// Initialize multer (max 5 files per request)
const upload = multer({ storage, fileFilter, limits: { files: 5 } });

// ─── PROTECTED ROUTES (Authentication Required) ─────────────────────────────
/**
 * POST /api/reports/
 * Submit a new stray dog report
 * Requirements:
 * - Authentication: Yes
 * - Files: 1-5 media files (max 1 video)
 * - Body: location, dogDetails, actionStatus
 *         + optional: adopterDetails or tempGuardianDetails
 * Effects:
 * - Creates report in database
 * - Awards REPORT_STRAY points to reporter
 * - If urgent, sends alerts to all welfare organizations
 * Returns: Success message and created report
 */
router.post(
  "/",
  authMiddleware,
  upload.array("media", 5),
  reportController.createReport,
);

// ─── PUBLIC ROUTES (No Authentication Required) ─────────────────────────────
/**
 * GET /api/reports/summary
 * Retrieve summary statistics of all reports
 * Returns: Counts by status
 * Used for: Dashboard overview statistics
 */
router.get("/summary", reportController.getSummaryCounts);

/**
 * GET /api/reports/
 * Get all stray dog reports
 * Returns: Array of all reports with full details
 * Used for: Map display and report browsing
 */
router.get("/", reportController.getAllReports);

// ─── PROTECTED ROUTES (Authentication Required) ─────────────────────────────
/**
 * PUT /api/reports/:reportId/status
 * Update the status of a stray dog report
 * Requirements:
 * - Authentication: Yes
 * - Parameters: Report ID
 * - Body: newStatus, actionDetails (optional)
 
 * Possible Status Values:
 * - "Permanently Adopted":
 * - "Temporarily Adopted":
 * - "Contacted Welfare Organizations":
 

 * Effects:
 * - Updates report status
 * - Awards appropriate reward points
 * - May update map color
 * Returns: Success message and updated report
 */
router.put("/:reportId/status", authMiddleware, reportController.updateStatus);

module.exports = router;
