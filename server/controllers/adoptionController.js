/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADOPTION CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This controller manages all adoption-related operations in the StrayCare system:
 * - Listing dogs available for adoption
 * - Fetching adoption listings with various filters (breed, location, age, status)
 * - Creating new adoption listings by users who want to list rescue dogs
 * - Handling adoption requests from potential adopters
 * - Confirming successful adoptions
 * - Managing the reward points system for facilitating adoptions
 * 
 * Key Features:
 * ✓ Adoption request management with email notifications
 * ✓ Status tracking (Available, Pending, Adopted)
 * ✓ Reward points system to incentivize adoptions
 * ✓ Security checks to prevent self-adoption
 * ✓ File upload handling for dog photos/videos
 */

const AdoptionListing = require("../models/AdoptionListing");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// ─── REWARD POINTS CONSTANTS ─────────────────────────────────────────────────
// These constants define how many reward points users earn for different actions
// This encourages user participation and community engagement
const POINTS = {
  PERMANENT_ADOPT: 50,      // Points awarded when a dog is permanently adopted
  TEMP_SHELTER: 20,         // Points awarded for providing temporary shelter
  REPORT_STRAY: 25,         // Points awarded for reporting a stray dog
  CONTACT_WELFARE: 10,      // Points awarded for contacting welfare organizations
  FACILITATE_ADOPTION: 30,  // Points awarded for facilitating an adoption
};


// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 1: getCounts
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Retrieves summary statistics about all dogs in the adoption system
 * 
 * Purpose: Provide dashboard overview with key metrics
 * 
 * Returns:
 * - totalDogs: Total number of all dog listings in the system
 * - availableDogs: Dogs with "Available" status (not yet adopted/pending)
 * - successfullyAdopted: Dogs with "Adopted" status (successfully adopted)
 * - pendingRequests: Dogs with "Pending" status (adoption request received)
 * 
 * @route GET /api/adoption/counts
 * @public No authentication required
 * @response {Object} Statistics object with adoption counts
 * @error 500 Server error
 */
// --- 1. Get Counts ---
exports.getCounts = async (req, res) => {
  try {
    // Count all documents with different status values
    const totalDogs = await AdoptionListing.countDocuments();
    const availableDogs = await AdoptionListing.countDocuments({
      status: "Available",
    });
    const successfullyAdopted = await AdoptionListing.countDocuments({
      status: "Adopted",
    });
    const pendingRequests = await AdoptionListing.countDocuments({
      status: "Pending",
    });

    // Return counts as JSON response
    res.status(200).json({
      totalDogs,
      availableDogs,
      successfullyAdopted,
      pendingRequests,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 2: getListings
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Fetches adoption listings with optional filters
 * 
 * Purpose: Allow users to search and filter dogs available for adoption
 * 
 * Query Parameters (all optional):
 * - breed: Filter by dog breed (case-insensitive)
 * - location: Filter by location (case-insensitive)
 * - age: Filter by dog age
 * - status: Filter by adoption status (Available, Pending, Adopted)
 * 
 * Results: Always sorted by most recently created first (newest first)
 * 
 * @route GET /api/adoption/listings
 * @public No authentication required
 * @query {String} breed - Dog breed filter
 * @query {String} location - Location filter
 * @query {String} age - Dog age filter
 * @query {String} status - Adoption status filter
 * @response {Array} Array of adoption listings matching filters
 * @error 500 Server error
 */
// --- 2. Get Listings (With Filters) ---
exports.getListings = async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { breed, location, age, status } = req.query;
    let query = {}; // MongoDB query object

    // Build dynamic query based on provided filters
    // Case-insensitive search using RegExp for breed and location
    if (breed) query["dogDetails.breed"] = new RegExp(breed, "i");
    if (location) query["dogDetails.location"] = new RegExp(location, "i");
    if (age) query["dogDetails.age"] = age;
    if (status) query.status = status;

    // Execute query and sort by creation date (newest first)
    const listings = await AdoptionListing.find(query).sort({ createdAt: -1 });
    
    // Return the filtered listings
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 3: createListing
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Creates a new adoption listing for a dog
 * 
 * Purpose: Allow users to list rescue dogs they want to get adopted
 * 
 * Request Body:
 * - dogDetails (JSON string): Contains breed, age, location, name, description
 * - listerDetails (JSON string): Contains name, email, contactNumber
 * - linkedReportId (optional): Links this listing to a stray dog report
 * - files (multipart): Dog photos/videos (max 3 files)
 * 
 * Process:
 * 1. Validate file count (max 3)
 * 2. Parse JSON strings into objects
 * 3. Validate all required fields are present
 * 4. Store uploaded file paths as media URLs
 * 5. Save listing with "Available" status
 * 6. Associate listing with authenticated user
 * 
 * @route POST /api/adoption/create
 * @private Requires authentication
 * @body {Object} Adoption listing details and dog information
 * @response {Object} Success message and created listing
 * @error 400 Validation errors (missing fields, too many files)
 * @error 500 Server error
 */
// --- 3. List a Dog ---
exports.createListing = async (req, res) => {
  try {
    // Extract form data from request
    const { dogDetails, listerDetails, linkedReportId } = req.body;
    const files = req.files || [];

    // Validation: Check maximum file upload limit
    if (files.length > 3) {
      return res
        .status(400)
        .json({ message: "Maximum upload limit exceeded." });
    }

    // Parse JSON strings that came through FormData (FormData converts to strings)
    const parsedDog = JSON.parse(dogDetails);
    const parsedLister = JSON.parse(listerDetails);

    // Validation: Ensure all required fields are present
    if (
      !parsedLister.name ||
      !parsedLister.email ||
      !parsedLister.contactNumber ||
      !parsedDog.breed ||
      !parsedDog.age ||
      !parsedDog.location
    ) {
      return res
        .status(400)
        .json({ message: "Please complete all required fields." });
    }

    // Convert uploaded files to media objects with URLs
    const media = files.map((file) => ({ url: file.path }));

    // Create new adoption listing document
    const newListing = new AdoptionListing({
      listerId: req.user.id,                          // Associate with current user
      linkedReportId: linkedReportId || null,         // Optional link to stray report
      dogDetails: parsedDog,                          // Dog information
      listerDetails: parsedLister,                    // Who is listing the dog
      media,                                          // Uploaded photos/videos
      // Status defaults to "Available" (set in schema)
    });

    // Save to database
    await newListing.save();
    
    // Return success response with created listing
    res
      .status(201)
      .json({ message: "Dog listed successfully", listing: newListing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 4: requestAdoption
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Submits an adoption request for a dog listing
 * 
 * Purpose: Allow potential adopters to express interest in adopting a dog
 * 
 * Process:
 * 1. Validate requester details (name, email, contact)
 * 2. Check that listing exists
 * 3. SECURITY: Prevent users from adopting their own listings
 * 4. Check listing is still available
 * 5. Change status from "Available" to "Pending"
 * 6. Save requester information
 * 7. Send email notification to the dog's lister
 * 
 * Security Features:
 * ✓ Users cannot request adoption for dogs they themselves listed
 * ✓ Only available dogs can be requested
 * ✓ Requester details are validated
 * 
 * @route POST /api/adoption/:id/request
 * @private Requires authentication
 * @param {String} id - Adoption listing ID
 * @body {Object} requesterName, requesterEmail, requesterContact
 * @response {Object} Success message and updated listing
 * @error 400 Invalid requester details or dog not available
 * @error 403 User trying to adopt their own listing
 * @error 404 Listing not found
 * @error 500 Server error
 */
// --- 4. Request to Adopt ---
exports.requestAdoption = async (req, res) => {
  try {
    // Extract listing ID from URL parameter
    const { id } = req.params;
    // Extract requester information from request body
    const { requesterName, requesterEmail, requesterContact } = req.body;

    // Validation: Check all requester details are provided
    if (!requesterName || !requesterEmail || !requesterContact) {
      return res
        .status(400)
        .json({ message: "Please complete all required fields." });
    }

    // Find the adoption listing by ID
    const listing = await AdoptionListing.findById(id);

    // Check if listing exists
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // SECURITY CHECK: Prevent self-adoption
    // Compare the lister's user ID with the current requester's user ID
    if (listing.listerId.toString() === req.user.id) {
      return res
        .status(403)
        .json({
          message: "You cannot request to adopt a dog you registered yourself.",
        });
    }

    // Check if dog is still available (not already pending or adopted)
    if (listing.status !== "Available") {
      return res
        .status(400)
        .json({ message: "This dog is no longer available." });
    }

    // Update listing status to "Pending" indicating a request was received
    listing.status = "Pending";
    // Store the requester's information
    listing.currentRequest = {
      requesterName,
      requesterEmail,
      requesterContact,
      requestDate: new Date(),
    };
    // Save the updated listing
    await listing.save();

    // Send email notification to the person who listed the dog
    sendEmail(
      listing.listerDetails.email,
      "New Adoption Request!",
      `
Hello,

You have received a new adoption request through the StrayCare system.

Dog Name: ${listing.dogDetails.name}

Interested Adopter: ${requesterName}
Contact Number: ${requesterContact}

Please contact the requester to discuss further details and proceed with the adoption.

Thank you for contributing to animal welfare 
— StrayCare Team
  `
    );

    // Return success response
    res.status(200).json({
      message: "Adoption requested successfully. The registered person has been notified.",
      listing,
    });
  } catch (error) {
    console.error("Error requesting adoption:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 5: confirmAdoption
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Confirms the successful completion of an adoption
 * 
 * Purpose: Finalize the adoption process after requester and lister agree
 * 
 * Process:
 * 1. Find the adoption listing by ID
 * 2. Verify only the listing creator can confirm the adoption
 * 3. Change status to "Adopted"
 * 4. Send confirmation emails to both lister and adopter
 * 5. Award reward points to both parties:
 *    - Lister receives FACILITATE_ADOPTION points (30 points)
 *    - Adopter receives PERMANENT_ADOPT points (50 points)
 * 6. Update user profiles with new reward points
 * 
 * Reward System:
 * - Lister gets points for facilitating the adoption
 * - Adopter gets points for adopting a rescue dog
 * 
 * @route POST /api/adoption/:id/confirm
 * @private Requires authentication (must be the lister)
 * @param {String} id - Adoption listing ID
 * @response {Object} Success message and updated listing
 * @error 403 Unauthorized (not the listing creator)
 * @error 404 Listing not found
 * @error 500 Server error
 */
// --- 5. Confirm Adoption ---
exports.confirmAdoption = async (req, res) => {
  try {
    // Extract listing ID from URL parameter
    const { id } = req.params;
    // Find the adoption listing by ID
    const listing = await AdoptionListing.findById(id);

    // Check if listing exists
    if (!listing)
      return res.status(404).json({ message: "Listing not found." });

    // SECURITY CHECK: Only the person who listed the dog can confirm adoption
    // This ensures that only the lister can approve who gets the dog
    if (listing.listerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    // Update listing status to "Adopted" - final state
    listing.status = "Adopted";
    await listing.save();

    // Extract requester information for email messages
    // Note: We use currentRequest which contains the selected adopter's info
    const requesterName = listing.currentRequest?.requesterName || "the adopter";

    // Send confirmation email to the dog lister
    sendEmail(
      listing.listerDetails.email,
      "Adoption Confirmed",
      `
Hello,

Great news! Adoption confirmed.

Your dog "${listing.dogDetails.name}" has been successfully adopted by ${requesterName} (${listing.currentRequest?.requesterContact}) through the StrayCare platform.

Thank you for your kindness and effort in helping a stray dog find a loving home.

— StrayCare Team
  `
    );

    // Send confirmation email to the adopter
    sendEmail(
      listing.currentRequest.requesterEmail,
      "Adoption Successfully Completed",
      `
Hello,

Congratulations!

The adoption of "${listing.dogDetails.name}" has been successfully completed.

You are now the proud new owner, so please ensure proper care, nutrition, and regular health check-ups.
We believe that you will provide a safe and comfortable environment for your new companion.

Thank you for making a difference in a stray dog's life.

— StrayCare Team
  `
    );

    // Award reward points to the lister for facilitating the adoption
    await User.findByIdAndUpdate(listing.listerId, {
      $inc: {
        rewardPoints: POINTS.FACILITATE_ADOPTION,               // Add 30 points
        "pointsBreakdown.adoptions": POINTS.FACILITATE_ADOPTION, // Track in breakdown
      },
    });

    // Award reward points to the adopter for adopting a rescue dog
    // Get the adopter email from the adoption request
    const adopterEmail = listing.currentRequest.requesterEmail;
    // Find the adopter user account
    const adopter = await User.findOne({ email: adopterEmail });
    // If adopter has an account, award points
    if (adopter) {
      await User.findByIdAndUpdate(adopter._id, {
        $inc: {
          rewardPoints: POINTS.PERMANENT_ADOPT,               // Add 50 points
          "pointsBreakdown.adoptions": POINTS.PERMANENT_ADOPT, // Track in breakdown
        },
      });
    }

    // Return success response with updated listing
    res
      .status(200)
      .json({ message: "Adoption confirmed successfully", listing });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- 6. Cancel Request ---
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await AdoptionListing.findById(id);

    if (!listing)
      return res.status(404).json({ message: "Listing not found." });

    if (listing.listerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    const requesterEmail = listing.currentRequest.requesterEmail;

    listing.status = "Available";
    listing.currentRequest = undefined; // Clear the request
    await listing.save();

    // Trigger Cancellation Emails

    
    sendEmail(
  listing.listerDetails.email,
  "Adoption Request Cancelled",
  `
Hello,

  The adoption request for "${listing.dogDetails.name}" has been cancelled.

  The dog is now available again on the StrayCare platform.

  Thank you for your support in helping stray animals .

  — StrayCare Team
  `
);
    sendEmail(
      requesterEmail,
      "Request Cancelled",
      `Unfortunately, the adoption request for ${listing.dogDetails.name} has been cancelled.
      The dog is now available again on the StrayCare platform.

      Thank you for your support in helping stray animals .

      — StrayCare Team`,
    );

    res
      .status(200)
      .json({ message: "Request cancelled. Dog is available again.", listing });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
