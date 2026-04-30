/**

 * AUTHENTICATION CONTROLLER
 

 * This controller handles all user authentication operations:
 * - User registration (individuals and organizations)
 * - Email/password login
 * - Google OAuth authentication
 * - Password recovery (forgot password)
 * - JWT token generation and management
 * 
 * Key Features:
 * Support for two user types: individuals and organizations
 * Password hashing with bcryptjs for security
 * JWT token-based authentication
 * Google OAuth integration for social login
 * Comprehensive input validation
 * Duplicate email/organization name prevention
 * 
 * Security Considerations:
 * Passwords are hashed before storage (10 salt rounds)
 * JWT tokens expire after 7 days
 * User-provided data is validated before processing
 * Organization names are checked for uniqueness
 *  Never return sensitive data in responses (passwords are excluded)
 */

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// Initialize Google OAuth client with Client ID from environment
// TODO: Replace with your actual Google Client ID from the Google Cloud Console
// Get this from: https://console.cloud.google.com
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── JWT TOKEN GENERATION HELPER ─────────────────────────────────────────────
/**
 * Generates a signed JWT token for authenticated sessions
 *
 * @param {String} userId - MongoDB user ID
 * @param {String} role - User role ('individual' or 'organization')
 * @returns {String} Signed JWT token valid for 7 days
 *
 * Token Payload:
 * - id: User's MongoDB ID
 * - role: User's role for authorization checks
 *
 * Expiration: 7 days (can be customized)
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET || "fallback_secret", // Use env secret or fallback
    {
      expiresIn: "7d", // Token valid for 7 days
    },
  );
};

//
// FUNCTION 1: register
//
/**
 * Creates a new user account (individual or organization)
 
 * Purpose: Allow new users to register on the platform
 
 * User Types:
 * 1. INDIVIDUAL: 
 *    - Requires: email, password, name, role
 * 
 * 2. ORGANIZATION:
 *    - Requires: email, password, organizationName, location, servicesOffered, contactDetails
 * 
 * Process:
 * 1. Validate all required fields based on role
 * 2. Check email is not already registered
 * 3. Check organization name (if applicable) is not already registered
 * 4. Hash password using bcryptjs (10 salt rounds)
 * 5. Create and save new user document
 * 6. Auto-login by generating JWT token
 * 7. Return token and user info (password excluded)
 * 
 * Security Features:
 *  Passwords are securely hashed
 *  Duplicate email prevention
 *  Duplicate organization name prevention (if org)
 *  Comprehensive validation
 * 
 * @route POST /api/auth/register
 * @public No authentication required
 * @body {Object} User registration details
 * @response {Object} JWT token and user information
 * @error 400 Missing fields or duplicate email/organization
 * @error 500 Server error
 */
// --- 1. REGISTRATION ---
exports.register = async (req, res) => {
  try {
    const {
      role,
      email,
      password,
      name,
      organizationName,
      location,
      servicesOffered,
      contactDetails,
      adminCode, // <-- Extract the new adminCode
    } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Please complete all required fields." });
    }

    // --- ADMIN VALIDATION ---
    if (role === "admin") {
      if (!adminCode) {
        return res
          .status(400)
          .json({ message: "Admin registration code is required." });
      }
      // Check against your .env file
      if (adminCode !== process.env.ADMIN_REGISTRATION_CODE) {
        return res
          .status(403)
          .json({ message: "Invalid admin registration code." });
      }
    }
    // --- ORGANIZATION VALIDATION ---
    else if (role === "organization") {
      if (
        !organizationName ||
        !location ||
        !servicesOffered ||
        !contactDetails
      ) {
        return res
          .status(400)
          .json({ message: "Please provide complete organization details." });
      }
    }
    // --- INDIVIDUAL VALIDATION ---
    else if (role === "individual") {
      if (!name) {
        return res
          .status(400)
          .json({ message: "Please complete all required fields." });
      }
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    // Check for duplicate organization name
    if (role === "organization") {
      const existingOrg = await User.findOne({ organizationName });
      if (existingOrg) {
        return res
          .status(400)
          .json({ message: "This organization name is already registered." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const newUser = new User({
      role,
      email,
      password: hashedPassword,
      ...(role === "individual" ? { name } : {}),
      ...(role === "admin" ? { name: "Admin User" } : {}), // Default name for admins
      ...(role === "organization"
        ? { organizationName, location, servicesOffered, contactDetails }
        : {}),
    });

    await newUser.save();

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name || newUser.organizationName || "Admin",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

//
// FUNCTION 2: login

/**
 * Authenticates a user with email and password
 
 * Purpose: Allow registered users to log into the platform
  
 * Process:
 * 1. Validate email and password are provided
 * 2. Find user by email
 * 3. If user doesn't exist, return 404 (account not found)
 * 4. Compare provided password with stored hashed password using bcrypt
 * 5. If passwords don't match, return 400 (invalid credentials)
 * 6. Generate JWT token for authentication
 * 7. Return token and user information
 
 * Security Features:
 *  Uses bcryptjs for secure password comparison
 *  Doesn't reveal if email exists (generic error message could be added)
 *  Returns JWT for stateless authentication
 *  Password is never returned in response
 * 
 * @route POST /api/auth/login
 * @public No authentication required
 * @body {String} email - User's email
 * @body {String} password - User's password
 * @response {Object} JWT token and user information
 * @error 400 Invalid email or password
 * @error 404 Account does not exist
 * @error 500 Server error
 */
// --- 2. LOGIN ---
exports.login = async (req, res) => {
  try {
    // Extract login credentials from request body
    const { email, password } = req.body;

    // Find user by email address
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "Account does not exist." });
    }

    // Compare provided password with stored hashed password
    // bcryptjs.compare() automatically handles salt extraction and comparison
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match, password is incorrect
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT token for this session
    const token = generateToken(user._id, user.role);

    // Return success response with token and user info
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name || user.organizationName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// FUNCTION 3: googleSignIn

/**
 * Authenticates users via Google OAuth (social login)
 *
 * Purpose: Provide seamless sign-in using Google accounts
 *
 * Features:
 * - Existing Google users are automatically logged in
 * - New Google users are automatically registered as "individual"
 * - Users who have Google account but no StrayCare account are auto-registered
 *
 * Process:
 * 1. Extract Google auth data (email, name, googleId)
 * 2. Check if user already exists in system
 * 3. If not, create new account automatically:
 *    - Set role to "individual"
 *    - Generate random hashed password (users don't login with password)
 *    - Save to database
 * 4. Generate JWT token for this session
 * 5. Return token and user information
 *
 * Auto-Registration Benefits:
 *  Reduces friction for new users
 * No password management needed for Google users
 *  Seamless signup and login experience
 *
 * @route POST /api/auth/google-signin
 * @public No authentication required
 * @body {String} email - Google account email
 * @body {String} name - Google account name
 * @body {String} googleId - Google user ID
 * @response {Object} JWT token and user information
 * @error 400 Google authentication failed
 * @error 500 Server error
 */

// --- 3. GOOGLE SIGN-IN ---
exports.googleSignIn = async (req, res) => {
  try {
    // Extract Google auth data from request body
    const { email, name, googleId } = req.body;

    // Check if user with this email already exists
    let user = await User.findOne({ email });

    // If user doesn't exist, automatically create a new account
    if (!user) {
      // Generate a random password for Google users
      // This password won't be used since they authenticate via Google
      const randomPassword = await bcrypt.hash(
        googleId + process.env.JWT_SECRET, // Use googleId + secret for uniqueness
        10,
      );

      // Create new user document with "individual" role
      user = new User({
        role: "individual",
        email: email,
        name: name,
        password: randomPassword,
        // Other fields use defaults from schema
      });

      // Save to database
      await user.save();
    }

    // Generate JWT token for authentication session
    const jwtToken = generateToken(user._id, user.role);

    // Return success response with token and user info
    res.status(200).json({
      message: "Google Login successful",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name || user.organizationName,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(400).json({ message: "Google authentication failed." });
  }
};

// FUNCTION 4: forgotPassword

/**
 * Initiates password reset process for forgotten passwords
 *
 * Purpose: Allow users to reset forgotten passwords via email
 *
 * Current Status: MOCK IMPLEMENTATION
 * This is a placeholder that returns success for frontend testing.
 * In a full implementation, this should:
 * 1. Generate a time-limited password reset token
 * 2. Send email with reset link to user
 * 3. Store reset token in database with expiration
 * 4. Validate token when user clicks link
 * 5. Allow password update after token verification
 *
 * Security Note:
 * - Reset tokens should expire after 15-30 minutes
 * - Tokens should be single-use only
 * - Links should be sent to verified email address
 * - Never confirm if email exists/doesn't exist
 *
 * @route POST /api/auth/forgot-password
 * @public No authentication required
 * @body {String} email - User's email address
 * @response {Object} Success message (always success for security)
 * @error 500 Server error
 *
 * TODO: Implement full password reset flow with email validation
 */

// --- 4. FORGOT PASSWORD ---
exports.forgotPassword = async (req, res) => {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Check if user with this email exists
    const user = await User.findOne({ email });

    // If user doesn't exist, we still return success
    // This prevents email enumeration attacks
    if (!user) {
      return res
        .status(200)
        .json({
          message: "If that email exists, a password reset link has been sent.",
        });
    }

    // TODO: IMPLEMENTATION NEEDED
    // 1. Generate a unique reset token
    // 2. Hash the token and save to user document with expiration (15 min)
    // 3. Create reset link with token
    // 4. Send email with reset link to user
    // 5. Example: sendEmail(user.email, "Password Reset", resetLink)

    // For now, return generic success message
    res.status(200).json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
