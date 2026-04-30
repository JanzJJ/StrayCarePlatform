/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REPORT MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This model represents a stray dog report submitted by a user
 * 
 * A report documents:
 * - Where a stray dog was found (location with GPS coordinates)
 * - What the dog looks like (description, breed, condition)
 * - The current outcome (adopted, sheltered, welfare org contacted)
 * - Evidence (photos and/or videos of the dog)
 * - Who is helping (adopter or temporary guardian details)
 * 
 * Map Integration:
 * - Each report is a map pin with color indicating status
 * - Red: Urgent help needed
 * - Green: Dog permanently adopted
 * - Yellow: Dog in temporary shelter
 * - Blue: Welfare organization contacted
 * 
 * Timeline:
 * - Report created when user finds stray dog
 * - Status updated as situation resolves
 * - Eventually marked as adopted or connected with organization
 */

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    // ─── REPORTER INFORMATION ───────────────────────────────────────────────
    /**
     * Reference to the User who submitted this report
     * - Links report to user account
     * - Used for identifying reporter for achievements and points
     */
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── LOCATION DATA ──────────────────────────────────────────────────────
    /**
     * Geographic location where dog was found
     * - lat, lng: GPS coordinates for map display
     * - address: Human-readable address
     * Used for map markers and route planning
     */
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },

    // ─── MEDIA FILES (Photos/Videos) ────────────────────────────────────────
    /**
     * Array of photos and videos of the dog
     * - url: Path to uploaded file
     * - fileType: Either "image" or "video"
     * Maximum 5 files per report (1 video max)
     * Stored in uploads/ directory on server
     */
    media: [
      {
        url: String,
        fileType: { type: String, enum: ["image", "video"] },
      },
    ],

    // ─── DOG INFORMATION ─────────────────────────────────────────────────────
    /**
     * Physical description and characteristics of the dog
     * - description: Detailed description of dog's appearance
     * - breed: Dog's breed (if identifiable)
     * - condition: Health condition (healthy, injured, sick, etc.)
     * Used for identification and matching with potential adopters
     */
    dogDetails: {
      description: { type: String, required: true },
      breed: { type: String, default: "Unknown" },
      condition: { type: String },
    },

    // ─── CURRENT STATUS / OUTCOME ───────────────────────────────────────────
    /**
     * Current status of the dog
     * - "Urgent Help Needed": Dog needs immediate assistance
     * - "Temporarily Adopted": Dog in temporary shelter/foster
     * - "Permanently Adopted": Dog found forever home
     * - "Contacted Welfare Organizations": Welfare org is helping
     * 
     * This status drives point awards and achievements
     */
    actionStatus: {
      type: String,
      enum: [
        "Permanently Adopted",
        "Temporarily Adopted",
        "Contacted Welfare Organizations",
        "Urgent Help Needed",
      ],
      required: true,
    },

    // ─── MAP COLOR CODING ───────────────────────────────────────────────────
    /**
     * Color of map marker based on dog status
     * - "Red": Urgent help needed (danger/critical)
     * - "Yellow": Temporarily adopted (safe but temporary)
     * - "Green": Permanently adopted (success!)
     * - "Blue": Welfare organization involved
     * Set automatically based on actionStatus in controller
     */
    mapColor: {
      type: String,
      enum: ["Green", "Yellow", "Blue", "Red"],
      required: true,
    },

    // ─── ADOPTION/GUARDIAN DETAILS ──────────────────────────────────────────
    /**
     * Details of the person who adopted the dog (permanent adoption)
     * - name: Adopter's name
     * - contact: Adopter's contact information
     * Only required if actionStatus === "Permanently Adopted"
     */
    adopterDetails: {
      name: String,
      contact: String,
    },

    /**
     * Details of the temporary guardian (temporary shelter)
     * - name: Guardian's name
     * - contact: Guardian's contact information
     * Only required if actionStatus === "Temporarily Adopted"
     */
    tempGuardianDetails: {
      name: String,
      contact: String,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("Report", reportSchema);
