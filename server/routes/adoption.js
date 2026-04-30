/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADOPTION ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Endpoints for managing dog adoption listings and requests
 
 */

const express = require("express");
const router = express.Router();
const adoptionController = require("../controllers/adoptionController");
const authMiddleware = require("../middleware/auth");

// ── Cloudinary uploader (replaces local multer diskStorage) ────────────────
const { uploadAdoption } = require("../config/cloudinary");

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────
router.get("/counts", adoptionController.getCounts);
router.get("/", adoptionController.getListings);

// ─── PROTECTED ROUTES ───────────────────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  uploadAdoption.array("media", 3),
  adoptionController.createListing
);

router.post("/:id/request", authMiddleware, adoptionController.requestAdoption);
router.put("/:id/confirm", authMiddleware, adoptionController.confirmAdoption);
router.put("/:id/cancel", authMiddleware, adoptionController.cancelRequest);

module.exports = router