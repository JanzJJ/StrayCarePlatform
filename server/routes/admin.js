const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Protect all admin routes: Must be logged in (auth) AND be an admin (isAdmin)
router.use(authMiddleware, isAdmin);

// Dashboard routes
router.get("/dashboard", adminController.getDashboardData);
router.delete("/reports/:id", adminController.deleteReport);
router.delete("/adoptions/:id", adminController.deleteAdoption);

// THIS IS THE LINE THAT WAS MISSING
module.exports = router;
