// server/middleware/isAdmin.js
module.exports = function (req, res, next) {
  // Ensure the user is logged in (auth.js middleware ran first) AND is an admin
  if (req.user && req.user.role === "admin") {
    next(); // Let them pass
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }
};
