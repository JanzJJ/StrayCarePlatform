/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REPORT CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This controller manages stray dog reports and rescue operations:
 * - Creating detailed reports about stray dogs found
 * - Tracking the status/outcome of reported dogs
 * - Managing map visualization with color-coded dog statuses
 * - Uploading photos and videos of dogs
 * - Rewarding users for reporting and helping dogs
 * - Sending urgent email notifications to welfare organizations
 */

const Report = require("../models/Report");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// ─── REWARD POINTS CONSTANTS ─────────────────────────────────────────────────
// These constants define how many reward points users earn for different actions.
// This encourages community participation in stray dog welfare.

const POINTS = {
  PERMANENT_ADOPT: 50, // Points for permanently adopting a dog
  TEMP_SHELTER: 20, // Points for temporarily sheltering a dog
  REPORT_STRAY: 25, // Points for reporting a stray dog
  CONTACT_WELFARE: 10, // Points for contacting welfare organizations
  FACILITATE_ADOPTION: 30, // Points for facilitating an adoption
};

// ─── HELPER FUNCTION: getMapColor ────────────────────────────────────────────
// This keeps the map marker colour consistent with the report status.

const getMapColor = (actionStatus) => {
  if (actionStatus === "Permanently Adopted") return "Green";
  if (actionStatus === "Temporarily Adopted") return "Yellow";
  if (actionStatus === "Contacted Welfare Organizations") return "Blue";
  return "Red"; // Default colour for "Urgent Help Needed"
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 1: createReport
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a detailed report about a stray dog discovered by a user.
 *
 * Supported action statuses:
 * - Urgent Help Needed
 * - Temporarily Adopted
 * - Permanently Adopted
 * - Contacted Welfare Organizations
 *
 * If the status is "Urgent Help Needed", the system sends emails to all
 * registered welfare organizations.
 *
 * @route POST /api/reports/create
 * @private Requires authentication
 */

exports.createReport = async (req, res) => {
  try {
    // Extract form data from the request body
    const {
      location,
      dogDetails,
      actionStatus,
      adopterDetails,
      tempGuardianDetails,
    } = req.body;

    const files = req.files || [];

    // Validate file upload limit
    if (files.length > 5) {
      return res.status(400).json({
        message: "Maximum upload limit exceeded.",
      });
    }

    // Validate video upload limit
    const videoCount = files.filter((file) =>
      file.mimetype.startsWith("video/")
    ).length;

    if (videoCount > 1) {
      return res.status(400).json({
        message: "Only 1 video is allowed.",
      });
    }

    // Validate required fields
    if (!location || !dogDetails || !actionStatus) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    // Parse JSON strings from FormData
    const parsedLocation = JSON.parse(location);
    const parsedDogDetails = JSON.parse(dogDetails);
    const parsedAdopter = adopterDetails ? JSON.parse(adopterDetails) : null;
    const parsedTemp = tempGuardianDetails
      ? JSON.parse(tempGuardianDetails)
      : null;

    // Validate permanent adoption details
    if (
      actionStatus === "Permanently Adopted" &&
      (!parsedAdopter?.name || !parsedAdopter?.contact)
    ) {
      return res.status(400).json({
        message: "Adopter's name and contact details are required.",
      });
    }

    // Validate temporary guardian details
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
      url: file.path.replace(/\\/g, "/"),
      fileType: file.mimetype.startsWith("video/") ? "video" : "image",
    }));

    // Determine map marker colour
    const mapColor = getMapColor(actionStatus);

    // Create new report
    const newReport = new Report({
      reporter: req.user.id,
      location: parsedLocation,
      dogDetails: parsedDogDetails,
      actionStatus,
      mapColor,
      adopterDetails: parsedAdopter,
      tempGuardianDetails: parsedTemp,
      media,
    });

    // Save report to database
    await newReport.save();

    // Award points to the user for submitting a stray dog report
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        rewardPoints: POINTS.REPORT_STRAY,
        "pointsBreakdown.reports": POINTS.REPORT_STRAY,
      },
    });

    /**
     * URGENT EMAIL LOGIC
     *
     * If the report status is "Urgent Help Needed", send email alerts
     * to all registered welfare organizations.
     *
     * This is wrapped in try/catch so the report still saves even if email fails.
     */
    if (actionStatus === "Urgent Help Needed") {
      try {
        await sendUrgentEmailsToOrgs(newReport);
      } catch (emailError) {
        console.error("❌ Urgent email failed, but report was saved.");
        console.error("Email error:", emailError.message);
      }
    }

    res.status(201).json({
      message: "Report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      message: "Server error while saving report.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 2: getSummaryCounts
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Retrieves summary statistics for dashboard display.
 *
 * @route GET /api/reports/summary
 * @public
 */

exports.getSummaryCounts = async (req, res) => {
  try {
    const total = await Report.countDocuments();

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

    res.status(200).json({
      total,
      green: permanentlyAdopted,
      yellow: temporarilyAdopted,
      blue: contactedWelfare,
      red: urgentHelp,
    });
  } catch (error) {
    console.error("Error getting report summary counts:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 3: getAllReports
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Retrieves all dog reports for map visualization.
 *
 * @route GET /api/reports/all
 * @public
 */

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate(
      "reporter",
      "name organizationName"
    );

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error getting all reports:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 4: updateStatus
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Updates the status/outcome of a reported stray dog.
 *
 * This also updates the map colour and awards reward points when appropriate.
 *
 * @route POST /api/reports/:reportId/update-status
 * @private Requires authentication
 */

exports.updateStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { newStatus, actionDetails } = req.body;

    if (!newStatus) {
      return res.status(400).json({
        message: "New status is required.",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
      });
    }

    const oldStatus = report.actionStatus;

    // Update status and map colour
    report.actionStatus = newStatus;
    report.mapColor = getMapColor(newStatus);

    // Store adopter details if the dog is now permanently adopted
    if (newStatus === "Permanently Adopted") {
      report.adopterDetails = actionDetails;
    }

    // Store temporary guardian details if the dog is temporarily adopted
    if (newStatus === "Temporarily Adopted") {
      report.tempGuardianDetails = actionDetails;
    }

    await report.save();

    // Determine reward points based on the new status
    let pointsToAward = 0;
    let category = "";

    if (newStatus === "Permanently Adopted") {
      pointsToAward = POINTS.PERMANENT_ADOPT;
      category = "adoptions";
    } else if (newStatus === "Temporarily Adopted") {
      pointsToAward = POINTS.TEMP_SHELTER;
      category = "community";
    } else if (newStatus === "Contacted Welfare Organizations") {
      pointsToAward = POINTS.CONTACT_WELFARE;
      category = "community";
    }

    // Award points only if the status actually changed
    if (oldStatus !== newStatus && pointsToAward > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: {
          rewardPoints: pointsToAward,
          [`pointsBreakdown.${category}`]: pointsToAward,
        },
      });
    }

    /**
     * OPTIONAL URGENT EMAIL LOGIC:
     *
     * If a report is updated to "Urgent Help Needed", welfare organizations
     * will also be notified.
     */
    if (oldStatus !== newStatus && newStatus === "Urgent Help Needed") {
      try {
        await sendUrgentEmailsToOrgs(report);
      } catch (emailError) {
        console.error("❌ Urgent email failed after status update.");
        console.error("Email error:", emailError.message);
      }
    }

    res.status(200).json({
      message: "Status updated successfully",
      report,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION: sendUrgentEmailsToOrgs
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sends urgent alert emails to all registered welfare organizations.
 *
 * This function:
 * 1. Finds all users with role "organization"
 * 2. Filters out users without email addresses
 * 3. Sends each organization an urgent email
 * 4. Logs results clearly in Render logs
 *
 * IMPORTANT:
 * This works only if organization users in MongoDB have:
 * role: "organization"
 */

const sendUrgentEmailsToOrgs = async (reportDetails) => {
  try {
    // Fetch all welfare organization users
    const orgs = await User.find({ role: "organization" }).select(
      "email name organizationName"
    );

    console.log(`🔍 Found ${orgs.length} organizations to notify.`);

    if (!orgs || orgs.length === 0) {
      console.warn("⚠️ No welfare organizations registered in the system.");
      return;
    }

    // Remove organizations without email addresses
    const validOrgs = orgs.filter((org) => org.email);

    if (validOrgs.length === 0) {
      console.warn(
        "⚠️ Organizations found, but none have valid email addresses."
      );
      return;
    }

    console.log(
      `📧 Sending urgent emails to: ${validOrgs
        .map((org) => org.email)
        .join(", ")}`
    );

    // Prepare report details safely
    const locationText =
      reportDetails.location?.address ||
      `Latitude: ${reportDetails.location?.latitude || "Not provided"}, Longitude: ${
        reportDetails.location?.longitude || "Not provided"
      }`;

    const dogDescription =
      reportDetails.dogDetails?.description || "No description provided.";

    const dogBreed = reportDetails.dogDetails?.breed || "Not provided";

    const dogAge = reportDetails.dogDetails?.age || "Not provided";

    const dogColor = reportDetails.dogDetails?.color || "Not provided";

    /**
     * Send emails one by one through sendEmail.js.
     *
     * Each organization receives a separate email for privacy.
     */
    const emailTasks = validOrgs.map((org) => {
      const organizationName =
        org.organizationName || org.name || "Welfare Organization";

      return sendEmail({
        to: org.email,
        subject: "URGENT: Stray Dog Needs Immediate Help",
        text: `
Hello ${organizationName},

An urgent stray dog report has been submitted through the StrayCare platform.

Report Details:
Status: Urgent Help Needed
Location: ${locationText}
Breed: ${dogBreed}
Age: ${dogAge}
Colour: ${dogColor}
Description: ${dogDescription}

Please log in to the StrayCare dashboard to view the full report, exact location, and uploaded photos/videos.

Your quick response could help save this dog's life.

Best regards,
StrayCare Team
        `,
      });
    });

    const results = await Promise.allSettled(emailTasks);

    results.forEach((result, index) => {
      const orgEmail = validOrgs[index].email;

      if (result.status === "fulfilled") {
        console.log(`📧 Urgent email process completed for: ${orgEmail}`);
      } else {
        console.error(`❌ Failed to send urgent email to: ${orgEmail}`);
        console.error(result.reason);
      }
    });

    console.log("✅ Urgent email notification process finished.");
  } catch (error) {
    console.error("❌ Failed to send urgent emails to organizations:", error);
    console.error("Error message:", error.message);
  }
};