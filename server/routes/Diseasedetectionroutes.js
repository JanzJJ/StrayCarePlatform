const express = require("express");
const router = express.Router();
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch"); // npm install node-fetch@2
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

// ── Config ─────────────────────────────────────────────────────────────────
const FLASK_URL = process.env.FLASK_URL || "http://localhost:5002";
const HEALTH_DETECTION_POINTS = 50; // Must match POINTS.HEALTH_DETECTION in userController.js

// ── Multer — store upload in memory, 10MB limit ────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// ── POST /api/disease-detection/analyze ────────────────────────────────────
// Auth is optional — guests can use detection, but won't earn points.
router.post(
  "/analyze",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    try {
      // ── 1. Forward image to Flask microservice ───────────────────────────
      const form = new FormData();
      form.append("image", req.file.buffer, {
        filename: req.file.originalname || "upload.jpg",
        contentType: req.file.mimetype,
      });

      const flaskResponse = await fetch(`${FLASK_URL}/predict`, {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
        // 30s timeout — model inference can take a few seconds on CPU
        timeout: 30000,
      });

      if (!flaskResponse.ok) {
        const errData = await flaskResponse.json().catch(() => ({}));
        throw new Error(
          errData.error || `Flask returned status ${flaskResponse.status}`,
        );
      }

      const detectionResult = await flaskResponse.json();

      // ── 2. Award points if a real condition was detected (not "Uncertain") ─
      if (req.user && detectionResult.disease !== "Uncertain") {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: {
            rewardPoints: HEALTH_DETECTION_POINTS,
            "pointsBreakdown.healthChecks": HEALTH_DETECTION_POINTS,
          },
        });
        // Attach points info to response so frontend can show it
        detectionResult.pointsAwarded = HEALTH_DETECTION_POINTS;
      }

      return res.status(200).json(detectionResult);
    } catch (error) {
      console.error("[disease-detection] Error:", error.message);

      // Give a user-friendly message if Flask is just not running
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch")
      ) {
        return res.status(503).json({
          message:
            "Disease detection service is currently unavailable. Please try again later.",
        });
      }

      return res
        .status(500)
        .json({ message: error.message || "Detection failed" });
    }
  },
);

// ── GET /api/disease-detection/status ─────────────────────────────────────
// Frontend can call this on page load to show a warning if Flask is down.
router.get("/status", async (req, res) => {
  try {
    const flaskHealth = await fetch(`${FLASK_URL}/health`, { timeout: 3000 });
    const data = await flaskHealth.json();
    return res.status(200).json({
      serviceOnline: true,
      modelLoaded: data.modelLoaded,
    });
  } catch {
    return res.status(200).json({
      serviceOnline: false,
      modelLoaded: false,
    });
  }
});

module.exports = router;
