/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADOPTION ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Endpoints for managing dog adoption listings and requests
 * 
 * Features:
 * - View available dogs for adoption
 * - Search and filter by breed, location, age, status
 * - List dogs for adoption (with photos)
 * - Request to adopt a dog
 * - Confirm/cancel adoption requests
 * 
 * Adoption Status Flow:
 * 1. User creates listing → Status: "Available"
 * 2. Someone requests adoption → Status: "Pending"
 * 3. Lister confirms adoption → Status: "Adopted"
 * 
 * File Upload:
 * - Maximum 3 photos per listing
 * - Only image files allowed
 * - Files stored in uploads/ directory
 * - Multer handles file storage and validation
 * 
 * Authentication:
 * - Viewing listings: No login required
 * - Listing/requesting/confirming: Login required
 */

const express = require("express");
const router = express.Router();
const adoptionController = require("../controllers/adoptionController");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");

// ─── FILE UPLOAD CONFIGURATION ──────────────────────────────────────────────
// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // All adoption photos stored in uploads/ directory
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Generate unique filename: "adopt-<timestamp>-<originalname>"
    cb(null, "adopt-" + Date.now() + "-" + file.originalname);
  },
});

// File filter: Only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept image files
  } else {
    cb(new Error("Please upload image files only."), false);
  }
};

// Initialize multer with config (max 3 files per request)
const upload = multer({ storage, fileFilter, limits: { files: 3 } });

// ─── PUBLIC ROUTES (No Authentication Required) ─────────────────────────────
/**
 * GET /api/adoption/counts
 * Retrieve adoption statistics
 * Returns: Total, available, adopted, pending dog counts
 */
router.get("/counts", adoptionController.getCounts);

/**
 * GET /api/adoption/
 * Get all adoption listings with optional filters
 * Query parameters:
 * - breed: Filter by dog breed
 * - location: Filter by location
 * - age: Filter by age
 * - status: Filter by status (Available, Pending, Adopted)
 */
router.get("/", adoptionController.getListings);

// ─── PROTECTED ROUTES (Authentication Required) ─────────────────────────────
/**
 * POST /api/adoption/
 * Create new adoption listing with dog photos
 * Requirements:
 * - Authentication: Yes
 * - Files: 1-3 image files
 * - Body: dogDetails, listerDetails (as JSON)
 * Returns: Created listing object
 */
router.post(
  "/",
  authMiddleware,
  upload.array("media", 3),
  adoptionController.createListing,
);

/**
 * POST /api/adoption/:id/request
 * Submit adoption request for a dog
 * Requirements:
 * - Authentication: Yes
 * - Parameters: Listing ID
 * - Body: requesterName, requesterEmail, requesterContact
 * Effect: Changes listing status to "Pending"
 * Notification: Email sent to lister
 */
router.post("/:id/request", authMiddleware, adoptionController.requestAdoption);

/**
 * PUT /api/adoption/:id/confirm
 * Confirm adoption (finalize the process)
 * Requirements:
 * - Authentication: Yes
 * - User must be the listing creator (lister)
 * Effect: Changes status to "Adopted", awards points to both parties
 * Notification: Emails sent to lister and adopter
 */
router.put("/:id/confirm", authMiddleware, adoptionController.confirmAdoption);

/**
 * PUT /api/adoption/:id/cancel
 * Cancel/reject adoption request
 * Requirements:
 * - Authentication: Yes
 * - User must be the listing creator
 * Effect: Returns listing to "Available" status
 */
router.put("/:id/cancel", authMiddleware, adoptionController.cancelRequest);

module.exports = router;
