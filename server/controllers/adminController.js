// server/controllers/adminController.js
const User = require("../models/User");
const Report = require("../models/Report");
const AdoptionListing = require("../models/AdoptionListing"); // Assuming this is your model name

// --- 1. Get All Dashboard Data ---
exports.getDashboardData = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const reports = await Report.find().sort({ createdAt: -1 });

    // Fetch adoptions (Adjust this based on how your Adoptions are modeled)
    const adoptions = await AdoptionListing.find().sort({ createdAt: -1 });

    res.status(200).json({
      users,
      reports,
      adoptions,
      stats: {
        totalUsers: users.length,
        totalReports: reports.length,
        totalAdoptions: adoptions.length,
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ message: "Server error fetching dashboard data." });
  }
};

// --- 2. Delete a Report ---
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await Report.findByIdAndDelete(id);
    res.status(200).json({ message: "Report permanently deleted." });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting report." });
  }
};

// --- 3. Delete an Adoption ---
exports.deleteAdoption = async (req, res) => {
  try {
    const { id } = req.params;
    await AdoptionListing.findByIdAndDelete(id);
    res.status(200).json({ message: "Adoption record permanently deleted." });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting adoption." });
  }
};
