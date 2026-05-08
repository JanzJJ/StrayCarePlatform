/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADOPTION CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This controller manages all adoption-related operations in the StrayCare system:
 * - Registering dogs available for adoption
 * - Fetching registered dogs with filters
 * - Creating new dog registrations
 * - Handling adoption requests
 * - Confirming successful adoptions
 * - Cancelling adoption requests
 * - Managing reward points
 *
 * Email Logic:
 * - When a user requests a dog, an email is sent to the registered person.
 * - When the registered person confirms the adoption, both the registered person and adopter receive emails.
 * - When a request is cancelled, both parties receive cancellation emails.
 */

const AdoptionListing = require("../models/AdoptionListing");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// ─── REWARD POINTS CONSTANTS ─────────────────────────────────────────────────
const POINTS = {
  PERMANENT_ADOPT: 50,
  TEMP_SHELTER: 20,
  REPORT_STRAY: 25,
  CONTACT_WELFARE: 10,
  FACILITATE_ADOPTION: 30,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 1: getCounts
// ═══════════════════════════════════════════════════════════════════════════════

exports.getCounts = async (req, res) => {
  try {
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

    res.status(200).json({
      totalDogs,
      availableDogs,
      successfullyAdopted,
      pendingRequests,
    });
  } catch (error) {
    console.error("Error getting adoption counts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 2: getListings
// ═══════════════════════════════════════════════════════════════════════════════

exports.getListings = async (req, res) => {
  try {
    const { breed, location, age, status } = req.query;

    const query = {};

    if (breed) query["dogDetails.breed"] = new RegExp(breed, "i");
    if (location) query["dogDetails.location"] = new RegExp(location, "i");
    if (age) query["dogDetails.age"] = age;
    if (status) query.status = status;

    const listings = await AdoptionListing.find(query).sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error getting adoption listings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 3: createListing
// ═══════════════════════════════════════════════════════════════════════════════

exports.createListing = async (req, res) => {
  try {
    const { dogDetails, listerDetails, linkedReportId } = req.body;
    const files = req.files || [];

    if (files.length > 3) {
      return res.status(400).json({
        message: "Maximum upload limit exceeded.",
      });
    }

    const parsedDog = JSON.parse(dogDetails);
    const parsedLister = JSON.parse(listerDetails);

    if (
      !parsedLister.name ||
      !parsedLister.email ||
      !parsedLister.contactNumber ||
      !parsedDog.breed ||
      !parsedDog.age ||
      !parsedDog.location
    ) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    const media = files.map((file) => ({
      url: file.path,
    }));

    const newListing = new AdoptionListing({
      listerId: req.user.id,
      linkedReportId: linkedReportId || null,
      dogDetails: parsedDog,
      listerDetails: parsedLister,
      media,
    });

    await newListing.save();

    res.status(201).json({
      message: "Dog listed successfully",
      listing: newListing,
    });
  } catch (error) {
    console.error("Error creating adoption listing:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 4: requestAdoption
// ═══════════════════════════════════════════════════════════════════════════════

exports.requestAdoption = async (req, res) => {
  try {
    const { id } = req.params;
    const { requesterName, requesterEmail, requesterContact } = req.body;

    if (!requesterName || !requesterEmail || !requesterContact) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    const listing = await AdoptionListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found.",
      });
    }

    if (listing.listerId.toString() === req.user.id) {
      return res.status(403).json({
        message: "You cannot request to adopt a dog you registered yourself.",
      });
    }

    if (listing.status !== "Available") {
      return res.status(400).json({
        message: "This dog is no longer available.",
      });
    }

    listing.status = "Pending";

    listing.currentRequest = {
      requesterName,
      requesterEmail,
      requesterContact,
      requestDate: new Date(),
    };

    await listing.save();

    /**
     * EMAIL 1:
     * Send an email to the dog lister when someone requests adoption.
     *
     * This email should not crash the adoption request if it fails.
     * Therefore, it is wrapped in a separate try/catch block.
     */
    try {
      if (listing.listerDetails?.email) {
        await sendEmail({
          to: listing.listerDetails.email,
          subject: `New Adoption Request for ${listing.dogDetails.name || "your listed dog"}`,
          text: `
Hello ${listing.listerDetails.name || "there"},

You have received a new adoption request through the StrayCare platform.

Dog Details:
Dog Name: ${listing.dogDetails.name || "Not provided"}
Breed: ${listing.dogDetails.breed || "Not provided"}
Location: ${listing.dogDetails.location || "Not provided"}

Interested Adopter Details:
Name: ${requesterName}
Email: ${requesterEmail}
Contact Number: ${requesterContact}

Please contact the requester to discuss further details and proceed with the adoption process.

Thank you for contributing to stray dog welfare.

Best regards,
StrayCare Team
          `,
        });

        console.log("📧 Adoption request email sent to lister.");
      } else {
        console.log("⚠️ Lister email not found. Adoption request email skipped.");
      }
    } catch (emailError) {
      console.error("❌ Failed to send adoption request email:", emailError.message);
    }

    res.status(200).json({
      message:
        "Adoption requested successfully. The registered person has been notified.",
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

exports.confirmAdoption = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await AdoptionListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found.",
      });
    }

    if (listing.listerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized action.",
      });
    }

    if (!listing.currentRequest || !listing.currentRequest.requesterEmail) {
      return res.status(400).json({
        message: "No adoption request found for this listing.",
      });
    }

    const dogName = listing.dogDetails.name || "the dog";

    const listerName = listing.listerDetails?.name || "there";
    const listerEmail = listing.listerDetails?.email;

    const requesterName = listing.currentRequest.requesterName || "the adopter";
    const requesterEmail = listing.currentRequest.requesterEmail;
    const requesterContact =
      listing.currentRequest.requesterContact || "Not provided";

    listing.status = "Adopted";
    listing.adoptedAt = new Date();

    await listing.save();

    /**
     * EMAIL 2 AND 3:
     * Send adoption confirmation emails to both:
     * 1. Dog lister
     * 2. Adopter/requester
     *
     * Promise.allSettled is used so one failed email does not stop the whole process.
     */
    const emailTasks = [];

    if (listerEmail) {
      emailTasks.push(
        sendEmail({
          to: listerEmail,
          subject: `Adoption Confirmed for ${dogName}`,
          text: `
Hello ${listerName},

Great news! The adoption of "${dogName}" has been successfully confirmed through the StrayCare platform.

Adopter Details:
Name: ${requesterName}
Email: ${requesterEmail}
Contact Number: ${requesterContact}

Thank you for your kindness and effort in helping a stray dog find a loving home.

Best regards,
StrayCare Team
          `,
        })
      );
    }

    if (requesterEmail) {
      emailTasks.push(
        sendEmail({
          to: requesterEmail,
          subject: `Your Adoption of ${dogName} Has Been Confirmed`,
          text: `
Hello ${requesterName},

Congratulations!

Your adoption of "${dogName}" has been successfully confirmed through the StrayCare platform.

Please stay in contact with the lister for any final handover arrangements and make sure your new companion receives proper care, nutrition, and regular health check-ups.

Thank you for choosing to adopt and for making a positive difference in a stray dog's life.

Best regards,
StrayCare Team
          `,
        })
      );
    }

    const emailResults = await Promise.allSettled(emailTasks);

    console.log("📧 Adoption confirmation email results:", emailResults);

    /**
     * Reward points are awarded after adoption confirmation.
     */

    await User.findByIdAndUpdate(listing.listerId, {
      $inc: {
        rewardPoints: POINTS.FACILITATE_ADOPTION,
        "pointsBreakdown.adoptions": POINTS.FACILITATE_ADOPTION,
      },
    });

    const adopter = await User.findOne({ email: requesterEmail });

    if (adopter) {
      await User.findByIdAndUpdate(adopter._id, {
        $inc: {
          rewardPoints: POINTS.PERMANENT_ADOPT,
          "pointsBreakdown.adoptions": POINTS.PERMANENT_ADOPT,
        },
      });
    }

    res.status(200).json({
      message: "Adoption confirmed successfully",
      listing,
    });
  } catch (error) {
    console.error("Error confirming adoption:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 6: cancelRequest
// ═══════════════════════════════════════════════════════════════════════════════

exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await AdoptionListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found.",
      });
    }

    if (listing.listerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized action.",
      });
    }

    if (!listing.currentRequest || !listing.currentRequest.requesterEmail) {
      return res.status(400).json({
        message: "No active adoption request found for this listing.",
      });
    }

    /**
     * Save requester details before clearing currentRequest.
     */
    const requesterName = listing.currentRequest.requesterName || "there";
    const requesterEmail = listing.currentRequest.requesterEmail;
    const dogName = listing.dogDetails.name || "the dog";
    const listerEmail = listing.listerDetails?.email;
    const listerName = listing.listerDetails?.name || "there";

    listing.status = "Available";
    listing.currentRequest = undefined;

    await listing.save();

    /**
     * EMAIL 4 AND 5:
     * Send cancellation emails to both:
     * 1. Dog lister
     * 2. Requester/adopter
     */
    const emailTasks = [];

    if (listerEmail) {
      emailTasks.push(
        sendEmail({
          to: listerEmail,
          subject: `Adoption Request Cancelled for ${dogName}`,
          text: `
Hello ${listerName},

The adoption request for "${dogName}" has been cancelled.

The dog is now available again on the StrayCare platform.

Thank you for your continued support in helping stray animals.

Best regards,
StrayCare Team
          `,
        })
      );
    }

    if (requesterEmail) {
      emailTasks.push(
        sendEmail({
          to: requesterEmail,
          subject: `Adoption Request Cancelled for ${dogName}`,
          text: `
Hello ${requesterName},

Unfortunately, the adoption request for "${dogName}" has been cancelled.

The dog is now available again on the StrayCare platform.

Thank you for your interest in adopting and supporting stray animal welfare.

Best regards,
StrayCare Team
          `,
        })
      );
    }

    const emailResults = await Promise.allSettled(emailTasks);

    console.log("📧 Adoption cancellation email results:", emailResults);

    res.status(200).json({
      message: "Request cancelled. Dog is available again.",
      listing,
    });
  } catch (error) {
    console.error("Error cancelling adoption request:", error);
    res.status(500).json({ message: "Server error" });
  }
};