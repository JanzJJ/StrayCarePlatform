/**
 
 * USER PROFILE ROUTES

 * Endpoints for user profile management and account settings

 * All routes are protected and require authentication
 * User information is retrieved from JWT token (req.user.id)
 
 * Features:
 * - View comprehensive user profile
 * - View reward points and achievements
 * - View contribution history (reports, adoptions)
 * - Update profile information
 * - Change password
 * - Delete account
 * - Track temporarily sheltered dogs
 * - Award points for health detection usage
 
 * Profile Data:
 * - Basic info: Name, email, role, contact details
 * - Points: Total points and breakdown by category
 * - Stats: Reports, adoptions, achievements
 * - History: All reports and adoptions by user
 * - Achievements: Dynamically computed based on contributions
 */

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

// ─── APPLY AUTHENTICATION TO ALL ROUTES ─────────────────────────────────────
// All profile routes require user to be logged in
router.use(authMiddleware);

// ─── PROFILE DATA & ACCOUNT MANAGEMENT ───────────────────────────────────────
/**
 * GET /api/users/profile
 * Retrieve complete user profile with all information
 * Returns:
 * - User details (name, email, role, contact info)
 * - Reward points and breakdown
 * - Stats (total reports, adoptions, achievements)
 * - All reports submitted by user
 * - All dogs temporarily sheltered by user
 * - All dogs adopted by user (from reports + platform)
 * - All unlocked achievements
 */
router.get("/profile", userController.getUserProfile);

/**
 * PUT /api/users/profile
 * Update user profile information
 * Updateable fields:
 * - name: User/organization name
 * - phone: Contact phone
 * - address: Residential/organizational address
 * - location: Geographic location (for orgs)
 * - contactDetails: For organizations
 * - servicesOffered: For organizations
 */
router.put("/profile", userController.updateProfile);

/**
 * PUT /api/users/profile/password
 * Change user's password
 * Requirements:
 * - Must provide current password for verification
 * - New password must meet security requirements
 */
router.put("/profile/password", userController.changePassword);

/**
 * DELETE /api/users/profile
 * Permanently delete user account
 * Effects:
 * - Removes user from database
 * - Cannot be undone
 * - User's reports/listings remain in system
 */
router.delete("/profile", userController.deleteAccount);

// ─── TEMPORARILY SHELTERED DOG MANAGEMENT ────────────────────────────────────
/**
 * PUT /api/users/profile/temp-dog/:reportId/adopt
 * Upgrade a temporarily sheltered dog to permanent adoption
 * Requirements:
 * - User must be the original reporter
 * - Dog must have status "Temporarily Adopted"
 * Parameters:
 * - reportId: ID of the report to upgrade
 * Body (optional):
 * - adopterDetails: New/updated adopter information
 * Effects:
 * - Changes dog status to "Permanently Adopted"
 * - Updates map color to green
 * - Awards PERMANENT_ADOPT points to user
 */
router.put(
  "/profile/temp-dog/:reportId/adopt",
  userController.updateTempDogStatus,
);


module.exports = router;
