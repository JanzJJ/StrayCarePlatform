// server/routes/public.js
const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

// GET /api/public/stats
// Public route - No authentication required
router.get("/stats", publicController.getPublicStats);

module.exports = router;
