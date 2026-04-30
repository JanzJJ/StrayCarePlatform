// server/controllers/publicController.js
const Report = require("../models/Report");
const AdoptionListing = require("../models/AdoptionListing"); // <-- Check this filename!

exports.getPublicStats = async (req, res) => {
  try {
    // 1. Total Dogs Reported (All reports ever made)
    const totalReported = await Report.countDocuments();

    // 2. Happily Adopted (Reports marked permanently adopted + Completed Adoptions)
    const adoptedReports = await Report.countDocuments({
      actionStatus: "Permanently Adopted",
    });
    const completedAdoptions = await AdoptionListing.countDocuments({
      status: "Adopted", // or "Completed", depending on your exact model enum
    });
    const happilyAdopted = adoptedReports + completedAdoptions;

    // 3. Total Dogs Rescued (Adopted + Temporarily Sheltered + Welfare Contacted)
    const tempSheltered = await Report.countDocuments({
      actionStatus: "Temporarily Adopted",
    });
    const welfareContacted = await Report.countDocuments({
      actionStatus: "Contacted Welfare Organizations",
    });
    const totalRescued = happilyAdopted + tempSheltered + welfareContacted;

    // 4. Rescued This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0); // Set to midnight on the 1st of the current month

    const rescuedThisMonth = await Report.countDocuments({
      actionStatus: {
        $in: [
          "Permanently Adopted",
          "Temporarily Adopted",
          "Contacted Welfare Organizations",
        ],
      },
      updatedAt: { $gte: startOfMonth },
    });

    // Send the compiled stats back to the landing page
    res.status(200).json({
      totalReported,
      totalRescued,
      rescuedThisMonth,
      happilyAdopted,
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    res.status(500).json({ message: "Server error fetching statistics." });
  }
};
