/**
 
 * REPORT CONTROLLER
 
 * 
 * This controller manages stray dog reports and rescue operations:
 * - Creating detailed reports about stray dogs found
 * - Tracking the status/outcome of reported dogs (adopted, sheltered, contacted welfare)
 * - Managing map visualization with color-coded dog statuses
 * - Uploading photos and videos of dogs
 * - Rewarding users for reporting and helping dogs
 * - Sending urgent notifications to welfare organizations

 */

const Report = require("../models/Report");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// ─── REWARD POINTS CONSTANTS ─────────────────────────────────────────────────
// These constants define how many reward points users earn for different actions
// To incentivize community participation in dog rescue

const POINTS = {
  PERMANENT_ADOPT: 50,      // Points for permanently adopting a dog
  TEMP_SHELTER: 20,         // Points for temporarily sheltering a dog
  REPORT_STRAY: 25,         // Points for reporting a stray dog
  CONTACT_WELFARE: 10,      // Points for contacting welfare organizations
  FACILITATE_ADOPTION: 30,  // Points for facilitating an adoption
};


// FUNCTION 1: createReport

/**
 * Creates a detailed report about a stray dog discovered by a user
 * 
 * Purpose: Document stray dogs found and their current status/outcome
 * 
 * Action Statuses Supported:
 * - "Urgent Help Needed": Dog needs immediate assistance, alerts sent to welfare orgs
 * - "Temporarily Adopted": Dog taken in for temporary shelter/guardianship
 * - "Permanently Adopted": Dog found a forever home
 * - "Contacted Welfare Organizations": Welfare org contacted to help
 * 
 * Process:
 * 1. Validate file uploads (max 5 files, max 1 video)
 * 2. Validate all required fields are present
 * 3. Parse JSON form data back into objects
 * 4. Validate action-specific requirements:
 *    - Permanent adoption needs adopter details
 *    - Temporary shelter needs guardian details
 * 5. Process media files and store URLs
 * 6. Determine map color based on action status
 * 7. Create and save report to database
 * 8. Award reward points to reporter
 * 9. Send urgent emails if status is "Urgent Help Needed"
 *
 * 
 * @route POST /api/reports/create
 * @private Requires authentication
 * @body {Object} location - {latitude, longitude, address}
 * @body {Object} dogDetails - Dog information and appearance
 * @body {String} actionStatus - Current status of the dog
 * @body {Object} adopterDetails (optional) - If permanently adopted
 * @body {Object} tempGuardianDetails (optional) - If temporarily sheltered
 * @body {File[]} files - Media files (max 5, max 1 video)
 * @response {Object} Success message and created report
 * @error 400 Validation errors
 * @error 500 Server error
 */

// --- 1. Create a Report ---
exports.createReport = async (req, res) => {
  try {
    // Extract form data from request
    const {
      location,
      dogDetails,
      actionStatus,
      adopterDetails,
      tempGuardianDetails,
    } = req.body;
    const files = req.files || [];

    // VALIDATION: Check file upload limits
    // Maximum 5 files total to prevent storage abuse
    if (files.length > 5) {
      return res
        .status(400)
        .json({ message: "Maximum upload limit exceeded." });
    }
    
    // Check that only 1 video is uploaded (video storage is expensive)
    const videoCount = files.filter((f) =>
      f.mimetype.startsWith("video/"),
    ).length;
    if (videoCount > 1) {
      return res.status(400).json({ message: "Only 1 video is allowed." });
    }

    // VALIDATION: Ensure all required fields are present
    if (!location || !dogDetails || !actionStatus) {
      return res
        .status(400)
        .json({ message: "Please complete all required fields." });
    }

    // Parse JSON strings back to objects
    // FormData converts all data to strings, so we need to parse them back
    const parsedLocation = JSON.parse(location);
    const parsedDogDetails = JSON.parse(dogDetails);
    const parsedAdopter = adopterDetails ? JSON.parse(adopterDetails) : null;
    const parsedTemp = tempGuardianDetails
      ? JSON.parse(tempGuardianDetails)
      : null;

    // VALIDATION: Action-specific requirements
    // If dog is permanently adopted, we need adopter information
    if (
      actionStatus === "Permanently Adopted" &&
      (!parsedAdopter?.name || !parsedAdopter?.contact)
    ) {
      return res
        .status(400)
        .json({ message: "Adopter's name and contact details are required." });
    }
    
    // If dog is temporarily adopted, we need guardian information
    if (
      actionStatus === "Temporarily Adopted" &&
      (!parsedTemp?.name || !parsedTemp?.contact)
    ) {
      return res.status(400).json({
        message: "Temporary guardian's name and contact details are required.",
      });
    }

    // Process uploaded media files
    const media = files.map((file) => ({
      url: file.path.replace(/\\/g, "/"), // Convert Windows paths to Unix format
      fileType: file.mimetype.startsWith("video/") ? "video" : "image",
    }));

    // Determine map color based on action status
    // This color will display on the map marker
    let mapColor = "Red"; // Default for urgent situations
    if (actionStatus === "Permanently Adopted") mapColor = "Green";
    else if (actionStatus === "Temporarily Adopted") mapColor = "Yellow";
    else if (actionStatus === "Contacted Welfare Organizations")
      mapColor = "Blue";

    // Create new report document
    const newReport = new Report({
      reporter: req.user.id,                    // Who is reporting
      location: parsedLocation,                 // Where dog was found
      dogDetails: parsedDogDetails,             // Physical description
      actionStatus,                             // Current outcome
      mapColor: mapColor,                       // Color for map display
      adopterDetails: parsedAdopter,            // If permanently adopted
      tempGuardianDetails: parsedTemp,          // If temporarily sheltered
      media,                                    // Photos/videos
    });

    // Save report to database
    await newReport.save();

    // Reward system: Add points to user for reporting a stray dog
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        rewardPoints: POINTS.REPORT_STRAY,              // Add 25 points
        "pointsBreakdown.reports": POINTS.REPORT_STRAY, // Track in reports category
      },
    });

    // Urgent Action: If dog needs urgent help, alert welfare organizations
    if (actionStatus === "Urgent Help Needed") {
      try {
        // Send emails to welfare organizations
        // Wrapped in try/catch because email might fail but report should still save
        await sendUrgentEmailsToOrgs(newReport);
      } catch (emailErr) {
        // Log error but don't fail the report creation
        console.error("Email failed, but report saved:", emailErr);
      }
    }

    // Return success response with created report
    res
      .status(201)
      .json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Server error while saving report." });
  }
};



// FUNCTION 2: getSummaryCounts

/**
 * Retrieves summary statistics about all reports for dashboard display
 * 
 * Purpose: Show overview of rescue operations by status
 * 
 * Returns:
 * - total: Total number of all dog reports  and counts for each action status:

 *
 * @route GET /api/reports/summary
 * @public No authentication required
 * @response {Object} Statistics by action status
 * @error 500 Server error
 */

// --- 2. Get Summary Counts ---
exports.getSummaryCounts = async (req, res) => {
  try {
    // Count total reports
    const total = await Report.countDocuments();
    
    // Count reports by each action status
    const permanentlyAdopted = await Report.countDocuments({
      actionStatus: "Permanently Adopted",
    });
    const temporarilyAdopted = await Report.countDocuments({
      actionStatus: "Temporarily Adopted",
    });
    const contactedWelfare = await Report.countDocuments({
      actionStatus: "Contacted Welfare Organizations",
    });
    const urgentHelp = await Report.countDocuments({
      actionStatus: "Urgent Help Needed",
    });

    // Return counts mapped to map colors
    res.status(200).json({
      total,
      green: permanentlyAdopted,     // Permanently adopted
      yellow: temporarilyAdopted,    // Temporary shelter
      blue: contactedWelfare,        // Welfare contacted
      red: urgentHelp,               // Urgent help needed
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// FUNCTION 3: getAllReports

/**
 * Retrieves all dog reports for map visualization
 * 
 * Purpose: Fetch all stray dog reports to display on interactive map
 * 
 * Details Included:
 * - Dog information (description, physical characteristics)
 * - Location coordinates and address
 * - Current status and outcome (adoption, shelter, welfare)
 * - Media files (photos and videos)
 * - Reporter information (name/organization)
 * - Map color coding for visual status indication
 * 
 * Populated Data:
 * - Reporter details populated from User collection (name and organization name)
 * 
 * @route GET /api/reports/all
 * @public No authentication required
 * @response {Array} Array of all dog reports with details
 * @error 500 Server error
 */
// --- 3. Get All Reports (For Map Display) ---
exports.getAllReports = async (req, res) => {
  try {
    // Fetch all reports and populate reporter name/organization details
    const reports = await Report.find().populate(
      "reporter",
      "name organizationName",
    );
    
    // Return all reports for map display
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// FUNCTION 4: updateStatus

/**
 * Updates the status/outcome of a reported stray dog
 * 
 * Purpose: Track the resolution of stray dog cases from initial report to final outcome
 * 
 * Status Transitions:
 * - "Urgent Help Needed" → Other statuses as situation resolves
 * - "Temporarily Adopted" → "Permanently Adopted" (when temp shelter becomes permanent)
 * - "Contacted Welfare Organizations" → "Permanently Adopted" (if welfare org succeeds)
 * 
 * Process:
 * 1. Find the report by ID
 * 2. Update action status to new status
 * 3. If transitioning to "Permanently Adopted", update adopter details
 * 4. Save updated report
 * 5. Award reward points based on new status (only if status actually changed)
 * 6. Points are tracked in appropriate category for user achievements
 * 
 * Reward Points for Status Updates
 
 * 
 * @route POST /api/reports/:reportId/update-status
 * @private Requires authentication
 * @param {String} reportId - Report ID to update
 * @body {String} newStatus - New action status
 * @body {Object} actionDetails (optional) - Additional details for the new status
 * @response {Object} Success message and updated report
 * @error 404 Report not found
 * @error 500 Server error
 */

// --- 4. Update Report Status ---
exports.updateStatus = async (req, res) => {
  try {
    // Extract report ID and new status from request
    const { reportId } = req.params;
    const { newStatus, actionDetails } = req.body;

    // Find the report by ID
    const report = await Report.findById(reportId);
    
    // Check if report exists
    if (!report) return res.status(404).json({ message: "Report not found." });

    // Store old status to check if it actually changed
    const oldStatus = report.actionStatus;
    
    // Update to new status
    report.actionStatus = newStatus;

    // If dog is now permanently adopted, update adopter information
    if (newStatus === "Permanently Adopted") {
      report.adopterDetails = actionDetails;
    }

    // Save the updated report
    await report.save();

    // Determine reward points based on new status
    let pointsToAward = 0;
    let category = "";

    if (newStatus === "Permanently Adopted") {
      pointsToAward = POINTS.PERMANENT_ADOPT; // 50 points
      category = "adoptions";
    } else if (newStatus === "Temporarily Adopted") {
      pointsToAward = POINTS.TEMP_SHELTER; // 20 points
      category = "community";
    } else if (newStatus === "Contacted Welfare Organizations") {
      pointsToAward = POINTS.CONTACT_WELFARE; // 10 points
      category = "community";
    }

    // Award points only if status actually changed (not duplicate update)
    if (oldStatus !== newStatus && pointsToAward > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: {
          rewardPoints: pointsToAward,                          // Add to total
          [`pointsBreakdown.${category}`]: pointsToAward,       // Track in category
        },
      });
    }

    // Return success response with updated report
    res.status(200).json({ message: "Status updated successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// HELPER FUNCTION: sendUrgentEmailsToOrgs

/**
 * Sends urgent alert emails to all registered welfare organizations
 * 
 * Purpose: Notify welfare organizations about dogs in urgent need of help
 * 
 * Process:
 * 1. Query database for all users with "organization" role
 * 2. Extract organization email addresses
 * 3. Send email to each organization with:
 *    - Dog location (address or coordinates)
 *    - Dog description
 *    - Link to view on dashboard
 * 
 * @param {Object} reportDetails - The report document to include in alert
 * @throws Logs error but doesn't crash if email fails
 * 
 * NOTE: This function is called automatically when a report with status
 *       "Urgent Help Needed" is created
 */
// --- Helper: Send Emails to Organizations ---
const sendUrgentEmailsToOrgs = async (reportDetails) => {
  try {
    // Fetch all users with role "organization" and their emails
    const orgs = await User.find({ role: "organization" }).select("email");

    // Send urgent alert email to each organization
    for (const org of orgs) {
      await sendEmail({
        to: org.email,
        subject: "URGENT: Stray Dog Needs Immediate Help!",
        text: `An urgent report has been filed near ${reportDetails.location.address || "the attached coordinates"}. \n\nDog Description: ${reportDetails.dogDetails.description}\n\nPlease log in to the StrayCare Dashboard to view the exact location and photos.`,
      });
    }
  } catch (error) {
    console.error("Failed to send urgent emails to organizations:", error);
  }
};
