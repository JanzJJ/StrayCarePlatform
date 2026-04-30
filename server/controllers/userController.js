/**

 * USER CONTROLLER

 * 
 * This controller manages user profiles and achievement systems:
 * - Fetching complete user profiles with stats and achievements
 * - Tracking user contributions (reports, adoptions, temporary shelter)
 * - Computing achievements dynamically based on user actions
 * - Updating dog status from temporary shelter to permanent adoption
 * - Managing password changes and profile updates
 
 
 */

const User = require("../models/User");
const Report = require("../models/Report");
const AdoptionListing = require("../models/AdoptionListing");
const bcrypt = require("bcryptjs");

// ─── REWARD POINTS CONSTANTS ─────────────────────────────────────────────────
// Single source of truth for reward points — update here propagates everywhere
const POINTS = {
  PERMANENT_ADOPT: 50,      // Points for permanently adopting a dog
  TEMP_SHELTER: 20,         // Points for temporarily sheltering a dog
  REPORT_STRAY: 25,         // Points for reporting a stray dog
  CONTACT_WELFARE: 10,      // Points for contacting welfare organizations
  FACILITATE_ADOPTION: 30,  // Points for facilitating an adoption
};

// ─── ACHIEVEMENT SYSTEM ────────────────────────────────────────────────────────
/**
 * Achievements are dynamically computed from actual user data rather than stored
 * in the database. This ensures achievements are always accurate and up-to-date.
 * 
 * Achievement Milestones:
 * 1. First Adoption (1+ permanent adoption)
 * 2. Triple Rescue (3+ permanent adoptions)
 * 3. Stray Reporter (5+ reports)
 * 4. Community Watchdog (10+ reports)
 * 5. Temporary Guardian (1+ temporary shelter)
 * 6. Welfare Connector (1+ welfare organization contact)

 */
/**
 * Dynamically computes achievements for a user based on their actions
 * 
 * Purpose: Generate achievement badges based on actual user contributions
 * 
 * Process:
 * 1. Analyze user's reports and adoptions
 * 2. Check milestones for each achievement type
 * 3. Award achievement if milestone is met
 * 4. Include achievement date, points, and description
 * 5. Sort by date (most recent first)
 * 
 * Achievements are NOT stored, they're computed on-the-fly, so:
 * - Achievements are always accurate
 * - Achievements can be earned/lost based on actions
 * - No separate DB collection needed
 * 
 * @param {Array} reports - User's reports from database
 * @param {Array} adoptedDogs - User's adopted dogs (from reports + platform listings)
 * @param {Object} user - User document (for health check points)
 * @returns {Array} Array of earned achievements sorted by date
 */
// ─── Achievement definitions ───────────────────────────────────────────────
function computeAchievements(reports, adoptedDogs, user) {
  // Array to store earned achievements
  const earned = [];
  
  // Calculate key metrics from user data
  const totalReports = reports.length;
  const permanentAdoptions = adoptedDogs.length;
  const tempSheltered = reports.filter(
    (r) => r.actionStatus === "Temporarily Adopted",
  ).length;
  const welfareContacts = reports.filter(
    (r) => r.actionStatus === "Welfare Contacted",
  ).length;

  // ADOPTION ACHIEVEMENTS
  // First Adoption: User has adopted at least 1 dog
  if (permanentAdoptions >= 1) {
    earned.push({
      id: "first_adoption",
      title: "First Adoption",
      description: "Permanently adopted a rescue dog",
      points: 500,
      date: adoptedDogs[0]?.updatedAt || adoptedDogs[0]?.createdAt,
      category: "adoption",
    });
  }

  // Triple Rescue: User has adopted at least 3 dogs
  if (permanentAdoptions >= 3) {
    earned.push({
      id: "triple_adoption",
      title: "Triple Rescue",
      description: "Permanently adopted 3 rescue dogs",
      points: 300,
      date: adoptedDogs[2]?.updatedAt,
      category: "adoption",
    });
  }

  // REPORT ACHIEVEMENTS
  // Stray Reporter: User has reported at least 5 dogs
  if (totalReports >= 5) {
    earned.push({
      id: "stray_reporter",
      title: "Stray Reporter",
      description: "Reported 5 stray dogs in need",
      points: 300,
      date: reports[4]?.createdAt,
      category: "report",
    });
  }

  // Community Watchdog: User has reported at least 10 dogs
  if (totalReports >= 10) {
    earned.push({
      id: "stray_reporter_pro",
      title: "Community Watchdog",
      description: "Reported 10 stray dogs",
      points: 500,
      date: reports[9]?.createdAt,
      category: "report",
    });
  }

  // COMMUNITY ACHIEVEMENTS
  // Temporary Guardian: User has temporarily sheltered at least 1 dog
  if (tempSheltered >= 1) {
    earned.push({
      id: "temp_shelter",
      title: "Temporary Guardian",
      description: "Provided temporary shelter to a dog",
      points: 200,
      date: reports.find((r) => r.actionStatus === "Temporarily Adopted")
        ?.updatedAt,
      category: "community",
    });
  }

  // Welfare Connector: User has contacted welfare organizations
  if (welfareContacts >= 1) {
    earned.push({
      id: "welfare_connector",
      title: "Welfare Connector",
      description: "Connected a stray with a welfare organisation",
      points: 50,
      date: reports.find((r) => r.actionStatus === "Welfare Contacted")
        ?.updatedAt,
      category: "community",
    });
  }


  // Sort achievements by date (most recent first)
  return earned.sort((a, b) => new Date(b.date) - new Date(a.date));
}



// FUNCTION 1: getUserProfile
//
/**
 * Fetches complete user profile with stats, achievements, and contribution history
 * 
 * Purpose: Provide comprehensive user profile page with all user data
 * 
 * Data Returned:
 * 1. User Profile:
 *    - Basic info (ID, email, role, name)
 *    - Contact details (phone, address)
 *    - Reward points and breakdown by category
 *    - Account creation date
 * 
 * 2. Statistics:
 *    - Total reports submitted
 *    - Dogs in temporary shelter
 *    - Total dogs adopted (from reports + platform)
 * 
 * 3. Historical Data:
 *    - All reports by this user
 *    - Temporarily sheltered dogs
 *    - Permanently adopted dogs (combined from reports and adoption platform)
 * 
 * 4. Achievements:
 *    - Dynamically computed from user contributions
 *    - Includes points and unlock dates
 * 
 * Process:
 * 1. Find user by ID (exclude password)
 * 2. Fetch all reports by this user
 * 3. Filter reports by action status
 * 4. Fetch adoption listings where user is the adopter
 * 5. Combine adoption sources (reports + platform)
 * 6. Compute achievements based on data
 * 7. Return comprehensive profile
 * 
 * @route GET /api/users/profile
 * @private Requires authentication
 * @response {Object} Complete user profile with stats and achievements
 * @error 404 User not found
 * @error 500 Server error
 */
// ─── 1. Get Full User Profile ──────────────────────────────────────────────
exports.getUserProfile = async (req, res) => {
  try {
    // Find user by ID and exclude password from result
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all reports submitted by this user, sorted newest first
    const reports = await Report.find({ reporter: req.user.id }).sort({
      createdAt: -1,
    });

    // Filter reports by action status
    // Dogs currently in temporary shelter
    const tempShelteredDogs = reports.filter(
      (r) => r.actionStatus === "Temporarily Adopted",
    );

    // Permanent adoptions from reports (user resolved the adoption themselves)
    const adoptedViaReports = reports.filter(
      (r) => r.actionStatus === "Permanently Adopted",
    );

    // Check adoption platform for dogs adopted by this user
    // User is identified by their email address
    const adoptedViaPlatform = await AdoptionListing.find({
      "currentRequest.requesterEmail": user.email,
      status: "Adopted",
    });

    // Combine both sources of adoptions
    const adoptedDogs = [...adoptedViaReports, ...adoptedViaPlatform];

    // Compute achievements dynamically from user data
    const achievements = computeAchievements(reports, adoptedDogs, user);

    // Return comprehensive profile
    res.status(200).json({
      user: {
        id: user._id,
        role: user.role,
        name: user.name || user.organizationName,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        rewardPoints: user.rewardPoints,
        pointsBreakdown: user.pointsBreakdown || {
          adoptions: 0,
          reports: 0,
          healthChecks: 0,
          community: 0,
        },
        createdAt: user.createdAt,
      },
      stats: {
        totalReports: reports.length,
        tempSheltered: tempShelteredDogs.length,
        totalAdopted: adoptedDogs.length,
      },
      reports,
      tempShelteredDogs,
      adoptedDogs,
      achievements,
    });
  } catch (error) {
    console.error("getUserProfile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};



// FUNCTION 2: updateTempDogStatus

/**
 * Upgrades a dog from temporary shelter to permanent adoption
 * 
 * Purpose: Allow users to finalize adoption of dogs they were temporarily sheltering
 * 
 * Process:
 * 1. Find the report by ID
 * 2. Verify user is the report creator (reporter)
 * 3. Verify dog status is currently "Temporarily Adopted"
 * 4. Update action status to "Permanently Adopted"
 * 5. Update map color to green (via pre-save hook in Report model)
 * 6. Save adopter details if provided
 * 7. Award PERMANENT_ADOPT reward points (50 points)
 * 8. Update user's adoptions breakdown points
 * 
 * Security:
 * Only the person who sheltered the dog can finalize adoption
 *  Status must be "Temporarily Adopted" (can't change from other statuses)
 * 
 * @route POST /api/users/upgrade-dog/:reportId
 * @private Requires authentication
 * @param {String} reportId - Report ID to upgrade
 * @body {Object} adopterDetails (optional) - Final adopter information
 * @response {Object} Success message, points awarded, and updated report
 * @error 400 Dog not in temporary shelter status
 * @error 403 User is not the reporter
 * @error 404 Report not found
 * @error 500 Server error
 */
// ─── 2. Upgrade Temporarily Sheltered Dog to Permanently Adopted ───────────
exports.updateTempDogStatus = async (req, res) => {
  try {
    // Extract report ID and adopter details from request
    const { reportId } = req.params;
    const { adopterDetails } = req.body;

    // Find the report by ID
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // SECURITY CHECK: Verify user is the one who reported this dog
    // Only the original reporter can finalize the adoption
    if (report.reporter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorised action" });
    }

    // VALIDATION: Check dog is currently in temporary shelter status
    // Can't upgrade if not temporarily adopted
    if (report.actionStatus !== "Temporarily Adopted") {
      return res
        .status(400)
        .json({ message: "Dog is not currently temporarily sheltered" });
    }

    // Update report status to permanent adoption
    report.actionStatus = "Permanently Adopted";
    
    // Update adopter details if provided
    if (adopterDetails) report.adopterDetails = adopterDetails;
    
    // Save updated report
    // Note: Pre-save hook in Report.js will automatically change mapColor to green
    await report.save();

    // Award reward points for successful permanent adoption
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        rewardPoints: POINTS.PERMANENT_ADOPT,                    // Add 50 points
        "pointsBreakdown.adoptions": POINTS.PERMANENT_ADOPT,     // Track in adoptions
      },
    });

    // Return success response with points awarded
    res.status(200).json({
      message: "Dog successfully upgraded to Permanently Adopted!",
      pointsAwarded: POINTS.PERMANENT_ADOPT,
      report,
    });
  } catch (error) {
    console.error("updateTempDogStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// FUNCTION 4: updateProfile
/**
 * Updates user profile information (name, contact details, location)
 * 
 * Purpose: Allow users to update their personal or organizational details
 * 
 * Fields That Can Be Updated:
 * - name: User's name (individuals)
 * - phone: Contact phone number
 * - address: Residential/organizational address
 * - location: Geographic location
 * - contactDetails: For organizations
 * - servicesOffered: For organizations (what services they provide)
 * 
 * @route POST /api/users/update-profile
 * @private Requires authentication
 * @body {Object} Profile fields to update
 * @response {Object} Success message and updated user data
 * @error 500 Server error
 */
// ─── 4. Update Profile Details ─────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, location, contactDetails, servicesOffered } =
      req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build the $set object for MongoDB
    const setData = {};

    if (user.role === "individual") {
      if (name !== undefined) setData.name = name.trim();
      if (phone !== undefined) setData.phone = phone ? phone.trim() : "";
      if (address !== undefined)
        setData.address = address ? address.trim() : "";
    }

    if (user.role === "organization") {
      if (location !== undefined) setData.location = location;
      if (contactDetails !== undefined) setData.contactDetails = contactDetails;
      if (servicesOffered !== undefined)
        setData.servicesOffered = servicesOffered;
    }

    // Use MongoDB's $set operator to persist all fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: setData },
      { returnDocument: "after", runValidators: true },
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// ─── 5. Change Password ────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({ message: "Server error changing password" });
  }
};

// ─── 6. Delete Account ─────────────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Clean up all related data so nothing is orphaned in the DB
    await Report.deleteMany({ reporter: userId });
    await AdoptionListing.deleteMany({
      "currentRequest.requesterEmail": user.email,
    });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("deleteAccount error:", error);
    res.status(500).json({ message: "Server error deleting account" });
  }
};

// ─── Export points constants so other controllers can use them ─────────────
exports.POINTS = POINTS;
