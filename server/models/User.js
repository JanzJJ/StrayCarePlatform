/**
 * 
 * USER MODEL
 * 
 * This model represents all users in the StrayCare system
 * 
 * Two User Types:
 * 1. INDIVIDUAL 
 * 2. ORGANIZATION 
 
 * Key Features:
 *  Role-based field requirements (individuals vs organizations)
 *  Reward points tracking with category breakdown
 *  Email uniqueness for authentication
 
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ─── AUTHENTICATION FIELDS (All Users) ─────────────────────────────────
    /**
     * User's role in the system
     * - "individual": Single person
     * - "organization": Shelter, welfare organization, pet shop, or vet clinic
     */
    // ─── AUTHENTICATION FIELDS (All Users) ─────────────────────────────────
    role: {
      type: String,
      enum: ["individual", "organization", "admin"], // <-- Added "admin" here
      required: [true, "Role is required"],
    },

    /**
     * User's email address
     * - Required for authentication and notifications
     * - Automatically lowercased for case-insensitive comparison
     * - Whitespace trimmed automatically
     */

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    /**
     * Hashed password (never stored in plaintext!)
     * - Should be hashed using bcryptjs before saving
     * - Never returned in API responses
     * - Used for email/password authentication
     */
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    rewardPoints: {
      type: Number,
      default: 0,
    },

    pointsBreakdown: {
      adoptions: { type: Number, default: 0 },
      reports: { type: Number, default: 0 },
      healthChecks: { type: Number, default: 0 },
      community: { type: Number, default: 0 },
    },

    // ─── INDIVIDUAL USER FIELDS ─────────────────────────────────────────────
    /**
     * Individual user's full name
     * - Required only if role === "individual"
     * - Used for display and communication
     * - Trimmed to remove leading/trailing whitespace
     */
    name: {
      type: String,
      required: function () {
        return this.role === "individual";
      },
      trim: true,
    },

    /**
     * Individual user's contact phone number
     * - Optional (defaults to empty string)
     * - Used for adoption and report communication
     */
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Individual user's residential address
     * - Optional (defaults to empty string)
     * - Can be updated via profile settings
     */
    address: {
      type: String,
      trim: true,
      default: "",
    },

    // ─── ORGANIZATION FIELDS ────────────────────────────────────────────────
    /**
     * Organization's legal name
     * - Required only if role === "organization"
     * - Must be unique (no duplicate organization names)
     * - Used for identification and communication
     * - Set as unique to prevent duplicates
     */
    organizationName: {
      type: String,
      required: function () {
        return this.role === "organization";
      },
      unique: true,
      sparse: true, // Allows null for non-org users
      trim: true,
    },

    /**
     * Organization's geographic location
     * - Required only if role === "organization"
     * - Used for service area and filtering
     */
    location: {
      type: String,
      required: function () {
        return this.role === "organization";
      },
    },

    /**
     * Services offered by organization
     * - Required only if role === "organization"
     * - Examples: "Dog rescue, medical care", "Pet adoption, grooming"
     * - Used for profile display and filtering
     */
    servicesOffered: {
      type: String,
      required: function () {
        return this.role === "organization";
      },
    },
    contactDetails: {
      type: String,
      required: function () {
        return this.role === "organization";
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
