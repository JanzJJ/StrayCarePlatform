/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTHENTICATION MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This middleware verifies JWT tokens for protected routes
 * 
 * Purpose:
 * - Protect routes that require authentication
 * - Extract and validate JWT tokens from request headers
 * - Attach user information to request object for use in controllers
 * - Return 401 Unauthorized if token is missing or invalid
 * 
 * How It Works:
 * 1. Checks for "Authorization" header in request
 * 2. Expects format: "Bearer <jwt_token>"
 * 3. Extracts token from "Bearer <token>" format
 * 4. Verifies token signature using JWT_SECRET
 * 5. If valid, attaches decoded payload (user ID and role) to req.user
 * 6. If invalid, returns 401 error
 * 
 * Usage in Routes:
 * const authMiddleware = require('../middleware/auth');
 * router.post('/protected-route', authMiddleware, controller.action);
 * 
 * Then in Controller:
 * req.user.id   // User's MongoDB ID
 * req.user.role // User's role ('individual' or 'organization')
 * 
 * Token Format (after verification):
 * {
 *   id: "user_mongodb_id",
 *   role: "individual" | "organization",
 *   iat: 1234567890,
 *   exp: 1234654290
 * }
 */

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    // Extract Authorization header from request
    // Header format: "Authorization: Bearer <token>"
    const token = req.header("Authorization");

    // VALIDATION: Check if token is present
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Extract the actual token from "Bearer <token>" format
    // split(" ")[0] = "Bearer"
    // split(" ")[1] = actual JWT token
    const decodedToken = token.split(" ")[1];

    // Verify token signature and expiration using JWT_SECRET
    // If verification fails, jwt.verify throws an error (caught below)
    const decoded = jwt.verify(
      decodedToken,
      process.env.JWT_SECRET || "fallback_secret",
    );

    // IMPORTANT: Attach decoded user info to request object
    // Controllers can now access req.user.id and req.user.role
    req.user = decoded;

    // Pass control to next middleware/controller
    next();
  } catch (err) {
    // Token is invalid, expired, or signature doesn't match
    res.status(401).json({ message: "Token is not valid" });
  }
};
