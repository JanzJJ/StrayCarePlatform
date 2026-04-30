/**

 * STRAYCARE BACKEND SERVER
 *
 * 
 * Main Entry Point for StrayCare Backend API
 * 
 * Overview:
 * This is the Express.js server that powers the StrayCare stray dog care platform.
 * It handles all API requests from the React frontend and manages:
 * - User authentication (registration, login, OAuth)
 * - Dog adoption listings and requests
 * - Stray dog reporting with location tracking
 * - User profiles and achievement system
 * - Disease detection API integration
 * - Resource discovery (vets, organizations, pet shops)
 * 
 * Technology Stack:
 * - Framework: Express.js 5.2.1
 * - Database: MongoDB with Mongoose
 * - Authentication: JWT tokens + Google OAuth
 * - File Storage: Multer for image/video uploads
 * - Cross-Origin: CORS enabled for React frontend
 * 
 * Environment Variables (required in .env):
 * - PORT: Server port (default: 5001)
 * - MONGO_URI: MongoDB Atlas connection string
 * - JWT_SECRET: Secret key for JWT token signing
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - EMAIL_USER: Gmail address for notifications
 * - EMAIL_PASS: Gmail app-specific password
 * - FLASK_URL: Python ML service URL for disease detection
 * - GOOGLE_MAPS_API_KEY: Google Maps API key
 * 
 * Architecture:
 * - routes/: API endpoint definitions
 * - controllers/: Business logic for each feature
 * - models/: MongoDB schema definitions (User, Report, AdoptionListing)
 * - middleware/: JWT authentication validation
 * - config/: Database connection setup
 * - utils/: Helper functions (email sending, etc.)
 * - uploads/: File storage for user uploads
 * 
 * Server Flow:
 * 1. Load environment variables from .env file
 * 2. Import required dependencies (Express, CORS, Path, Database)
 * 3. Establish MongoDB connection via connectDB()
 * 4. Configure Express middleware (CORS, JSON parsing, file uploads)
 * 5. Mount API route handlers
 * 6. Start listening on configured PORT
 * 7. Accept incoming HTTP requests from React frontend
 * 
 * Security Considerations:
 * - CORS configured to accept requests from frontend
 * - JWT middleware protects authenticated endpoints
 * - Password hashing with bcryptjs (not stored in plain text)
 * - File upload validation (MIME types, file size limits)
 * - Environment variables keep secrets out of source code
 * 
 * Typical Request Flow:
 * 1. Frontend sends HTTP request to /api/<route>
 * 2. Middleware processes request (parse JSON, validate JWT)
 * 3. Route handler directs to appropriate controller
 * 4. Controller executes business logic, queries database
 * 5. Response sent back to frontend (success or error)
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
 * This function:
 * - Sets up DNS configuration for SRV record resolution
 * - Establishes Mongoose connection to MongoDB cluster
 * - Initializes database for all subsequent operations
 *
 * If connection fails, the process exits (see config/db.js for details)
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
app.use(cors());

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

/**
 * Static File Serving Middleware
 * Makes /uploads directory publicly accessible via HTTP
 *
 * Without this:
 * - Images/videos would stay hidden on server filesystem
 * - Frontend couldn't access uploaded files
 *
 * With this:
 * - Image stored at: server/uploads/adopt-1234567890-fluffy.jpg
 * - Accessible at: http://server:5001/uploads/adopt-1234567890-fluffy.jpg
 * - Frontend can display with <img src="/uploads/adopt-1234567890-fluffy.jpg" />
 *
 * Path Resolution:
 * - __dirname: Full path to server directory (/path/to/straycare-system/server)
 * - path.join(__dirname, "uploads"): Full path to uploads folder
 * - express.static(): Serve files from that directory
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
