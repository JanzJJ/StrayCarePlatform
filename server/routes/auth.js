/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTHENTICATION ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * All authentication-related API endpoints
 * 
 * Routes Provided:
 * - POST /api/auth/register: User registration (individuals & organizations)
 * - POST /api/auth/login: Email/password login
 * - POST /api/auth/google: Google OAuth authentication
 * - POST /api/auth/forgot-password: Password recovery initiation
 * 
 * Authentication Methods:
 * 1. Traditional: Email + Password
 *    - Users create account with email and password
 *    - Password is hashed before storage
 *    - Login verifies credentials and returns JWT token
 * 
 * 2. Google OAuth (Social Login):
 *    - Users sign in with Google account
 *    - Auto-creates account if doesn't exist
 *    - No password management required
 * 
 * Token Format:
 * - JWT tokens expire after 7 days
 * - Must include "Authorization: Bearer <token>" in subsequent requests
 * - Token contains user ID and role
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ─── STANDARD AUTHENTICATION ────────────────────────────────────────────────
/**
 * POST /api/auth/register
 * Creates a new user account
 * Supports two roles: "individual" or "organization"
 * Auto-logs in user and returns JWT token
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Authenticates user with email and password
 * Returns JWT token if credentials are valid
 */
router.post("/login", authController.login);

// ─── GOOGLE AUTHENTICATION ──────────────────────────────────────────────────
/**
 * POST /api/auth/google
 * Authenticates user via Google OAuth
 * Auto-creates account if user doesn't exist
 * Always creates "individual" role accounts
 */
router.post("/google", authController.googleSignIn);

// ─── PASSWORD MANAGEMENT ────────────────────────────────────────────────────
/**
 * POST /api/auth/forgot-password
 * Initiates password recovery process
 * Currently: Returns success message (implementation needed)
 * TODO: Send reset link via email
 */
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
