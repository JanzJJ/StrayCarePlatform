/**
 * Architecture:
 * - routes/: API endpoint definitions
 * - controllers/: Business logic for each feature
 * - models/: MongoDB schema definitions (User, Report, AdoptionListing)
 * - middleware/: JWT authentication validation
 * - config/: Database connection setup
 * - utils/: Helper functions (email sending, etc.)
 * - uploads/: File storage for user uploads
 
 */

// ─── INITIALIZATION ─────────────────────────────────────────────────────────
// Load environment variables from .env file into process.env
// This must be first to ensure all environment variables are available
require("dotenv").config();

// ─── DEPENDENCIES ───────────────────────────────────────────────────────────
const express = require("express"); // Web framework
const cors = require("cors"); // Cross-Origin Resource Sharing
const path = require("path"); // Node.js path utilities
const connectDB = require("./config/db"); // Custom MongoDB connection function

// ─── DATABASE CONNECTION ──────────────────────────────────────────────────
/**
 * Establish connection to MongoDB Atlas
 */
connectDB();

// ─── EXPRESS APP INITIALIZATION ───────────────────────────────────────────
/**
 * Create Express application instance
 * This will be configured with middleware and routes below
 */
const app = express();

// ─── MIDDLEWARE CONFIGURATION ──────────────────────────────────────────────
/**
 * Global middleware that processes all incoming requests
 * Middleware executes in the order defined
 */

/**
 * CORS Middleware - Enable Cross-Origin Requests
 * Allows React frontend (running on different port/domain) to communicate with API
 * Without this, browser would block requests due to Same-Origin Policy
 *
 * Default CORS config allows requests from all origins
 * (In production, you may want to restrict to specific frontend URL)
 */
app.use(cors({
  origin: [
    "http://localhost:5173", // Local development
    "http://localhost:3000", // Alternative local port
    "https://stray-care-platform.vercel.app", // Production Vercel frontend
  ],
  credentials: true, // Allow cookies/auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

/**
 * JSON Parser Middleware
 * Automatically parses incoming request bodies with Content-Type: application/json
 * Transforms raw request stream into req.body JavaScript object
 *
 * Without this middleware, req.body would be undefined for JSON requests
 * Example: POST /api/auth/register with {"email": "user@example.com"}
 *          becomes req.body = {email: "user@example.com"}
 */
app.use(express.json());

/**
 * URL-Encoded Parser Middleware
 * Parses form data (application/x-www-form-urlencoded)
 * extended: true uses 'qs' library to handle complex nested objects
 *
 * Critical for Multer integration - handles FormData from file uploads
 * When frontend uploads files:
 * 1. FormData includes text fields + files
 * 2. This middleware parses the text fields
 * 3. Multer middleware (in routes) handles the file parts
 */
app.use(express.urlencoded({ extended: true }));



// ─── ROUTE MOUNTING ───────────────────────────────────────────────────────
/**
 * Route mounting - Connect route handlers to API paths
 * Each route handler file exports a router with multiple endpoints
 *
 * Request Flow Example:
 * 1. Frontend: POST /api/auth/login
 * 2. Server matches /api/auth prefix
 * 3. Routes to require("./routes/auth") handler
 * 4. auth.js router processes /login endpoint
 * 5. authController.login() executes business logic
 */

/**
 * Authentication Routes (/api/auth/*)
 * Endpoints: /register, /login, /google, /forgot-password
 * Controller: authController.js
 * Functions: User registration, login, Google OAuth, password recovery
 */
app.use("/api/auth", require("./routes/auth"));

/**
 * Stray Dog Report Routes (/api/reports/*)
 * Endpoints: POST /, GET /, GET /summary, PUT /:reportId/status
 * Controller: reportController.js
 * Functions: Submit reports, retrieve reports, update dog status
 * Features: File uploads (images + video), urgent alerts, location tracking
 */
app.use("/api/reports", require("./routes/reports"));

/**
 * Dog Adoption Routes (/api/adoption/*)
 * Endpoints: GET /, POST /, POST /:id/request, PUT /:id/confirm
 * Controller: adoptionController.js
 * Functions: Manage adoption listings, requests, and confirmations
 * Features: File uploads (max 3 images), reward points, email notifications
 */
app.use("/api/adoption", require("./routes/adoption"));

/**
 * User Profile Routes (/api/users/*)
 * Endpoints: GET /profile, PUT /profile, DELETE /profile, etc.
 * Controller: userController.js
 * Functions: Profile management, achievements, temp dog adoption tracking
 * Security: All endpoints require JWT authentication
 */
app.use("/api/users", require("./routes/user"));

/**
 * Resource Discovery Routes (/api/hub/*)
 * Endpoints: GET /organizations, GET /services
 * Functions: Find welfare organizations, vets, pet shops
 * Features: Database queries + Google Maps API integration
 */
app.use("/api/hub", require("./routes/hub"));

/**
 * Disease Detection Routes (/api/disease-detection/*)
 * Integration with Python Flask ML service
 * Functions: Submit dog images for skin disease analysis
 * Features: Multer file upload, Flask API communication
 */
app.use("/api/disease-detection", require("./routes/Diseasedetectionroutes"));

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const publicRoutes = require("./routes/public");
app.use("/api/public", publicRoutes);

// ─── HEALTH CHECK ENDPOINT ────────────────────────────────────────────────
/**
 * GET /
 * Basic health check endpoint
 *
 * Purpose:
 * - Verify server is running and responding
 * - Used for deployment health checks
 * - Simple way to test API connectivity
 *
 * Response: Plain text message "StrayCare API is running..."
 * Status: 200 OK
 *
 * Note: No authentication required - this is a public endpoint
 */
app.get("/", (req, res) => {
  res.send("StrayCare API is running...");
});

// ─── SERVER STARTUP ───────────────────────────────────────────────────────
/**
 * Extract server port from environment or use default
 * process.env.PORT: Value from .env file or environment
 * 5001: Default fallback port if PORT not specified
 *
 * This allows flexibility:
 * - Development: Use default 5001
 * - Production: Set PORT=8080 in environment
 * - Docker: Container can set custom PORT
 */
const PORT = process.env.PORT || 5001;

/**
 * Start listening for incoming HTTP requests
 *
 * What happens here:
 * 1. Express server binds to PORT
 * 2. Server becomes available to accept requests
 * 3. Frontend can now send requests to http://server:5001/api/*
 * 4. Server logs message to console for verification
 *
 * Log Output: "Server started on port 5001"
 * This confirms the server is ready to receive requests
 *
 * To stop server: Press Ctrl+C in terminal
 */
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
