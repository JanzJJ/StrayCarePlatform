/**
 * 
 * ADOPTION LISTING MODEL
 
 * 
 * This model represents a dog registered for adoption
 * 

 * 
 * Adoption Status Lifecycle:
 * 1. "Available": Open for adoption requests
 * 2. "Pending": Received adoption request, waiting for confirmation
 * 3. "Adopted": Adoption confirmed and completed
 * 
 * Reward Points:
 * - Registered person gets points when dog is adopted (30 points)
 * - Adopter gets points when they adopt (50 points)
 */

const mongoose = require("mongoose");

const adoptionListingSchema = new mongoose.Schema(
  {
    // ─── REGISTERED PERSON INFORMATION ─────────────────────────────────────────────────
    /**
     * Reference to the User who registered this dog
     * - The person offering the dog for adoption
     * - Receives reward points when dog is adopted
     * - Can confirm adoption requests for this dog
     */
    listerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Optional link to a Report where this dog was originally found
     * - If user found a stray dog and later wants to list for adoption
     * - Allows tracking dog's journey from report to adoption
     * - Can be null if dog came from other sources
     */
    linkedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },

    // ─── DOG INFORMATION ─────────────────────────────────────────────────────
    /**
     * Detailed information about the dog
     * - name: Dog's name/nickname
     * - breed: Dog's breed
     * - age: Dog's age (e.g., "2 years", "juvenile", "puppy")
     * - gender: Male or Female
     * - location: Where dog is currently located
     * - description: Additional description, personality traits
     * Used for dog identification and matching with adopters
     */
    dogDetails: {
      name: { type: String, default: "Unknown" },
      breed: { type: String, required: true },
      age: { type: String, required: true },
      gender: { type: String, enum: ["Male", "Female"] },
      location: { type: String, required: true },
      description: { type: String },
    },

    // ─── REGISTERED PERSON (PERSON OFFERING DOG) DETAILS ───────────────────────────────
    /**
     * Information about the person who registered the dog
     * - name: Contact person's name
     * - email: Email address for adoption inquiries
     * - contactNumber: Phone number for interested adopters to reach out
     * All fields required to enable adopter communication
     */
    listerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      contactNumber: { type: String, required: true },
    },

    // ─── MEDIA FILES (Photos) ───────────────────────────────────────────────
    /**
     * Array of photos of the dog
     * - url: Path to uploaded image file
     * - Maximum 3 photos per listing (enforced at controller level)
     * - Stored in uploads/ directory
     * Used to showcase dog to potential adopters
     */
    media: [
      {
        url: String,
      },
    ],

    // ─── ADOPTION STATUS ────────────────────────────────────────────────────
    /**
     * Current adoption status of the listing
     * - "Available": Open for adoption requests (default)
     * - "Pending": Received adoption request, awaiting confirmation
     * - "Adopted": Dog has been successfully adopted
     */
    status: {
      type: String,
      enum: ["Available", "Pending", "Adopted"],
      default: "Available",
    },

    // ─── CURRENT ADOPTION REQUEST ───────────────────────────────────────────
    /**
     * Details of the current adoption request (if status is "Pending")
     * - requesterName: Name of person requesting to adopt
     * - requesterEmail: Email for adoption confirmation
     * - requesterContact: Phone number for communication
     * - requestDate: When the adoption request was submitted
     * 
     * Populated when adoption request is submitted
     * Used for confirmation and point awards
     */
    currentRequest: {
      requesterName: String,
      requesterEmail: String,
      requesterContact: String,
      requestDate: Date,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("AdoptionListing", adoptionListingSchema);
