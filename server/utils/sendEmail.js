/**
 
 * EMAIL SENDING UTILITY
 
 * This utility sends transactional emails to users and organizations
 
  
 * Email Provider: Gmail (via SMTP)
 * Authentication: Gmail App Password (not regular Gmail password)
 
 * Environment Variables Required:
 * - EMAIL_USER: Gmail address configured for SMTP
 * - EMAIL_PASS: Gmail App Password (generated in Gmail settings)
 * 
 * 
 * Flexible Input Format:
 * - sendEmail(email, subject, text)
 * - sendEmail({ to, subject, text })

 */

const nodemailer = require("nodemailer");

/**
 * Sends an email to specified recipient
 * 
 * @param {String|Object} optionsOrTo - Either email string or options object
 * @param {String} subject - Email subject (when first param is string)
 * @param {String} text - Email body/message (when first param is string)
 * 
 * @returns {Promise<void>}
 * 
 * Examples:
 * // Format 1: Separate parameters
 * await sendEmail('user@example.com', 'Welcome', 'Welcome to StrayCare!');
 * 
 * // Format 2: Options object
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Adoption Confirmed',
 *   text: 'Your adoption is confirmed!'
 * });
 * 
 * Error Handling:
 * - Returns silently if no recipient email
 * - Logs errors but doesn't throw
 * - Safe to call in fire-and-forget scenarios
 */
const sendEmail = async (optionsOrTo, subject, text) => {
  // FLEXIBLE INPUT PARSING
  // Support both direct parameters and options object
  const toAddress =
    typeof optionsOrTo === "object" ? optionsOrTo.to : optionsOrTo;
  const emailSubject =
    typeof optionsOrTo === "object" ? optionsOrTo.subject : subject;
  const emailText = typeof optionsOrTo === "object" ? optionsOrTo.text : text;

  // VALIDATION: Ensure recipient email is provided
  // Silent return prevents errors if email is accidentally omitted
  if (!toAddress) {
    console.log(
      "⚠️ Skipped sending email: No recipient email address provided.",
    );
    return;
  }

  try {
    // CREATE EMAIL TRANSPORTER (Gmail SMTP Configuration)
    // Uses environment variables for authentication
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // Gmail address configured to send emails
        user: process.env.EMAIL_USER,
        // App-specific password (16 chars from Gmail settings)
        pass: process.env.EMAIL_PASS,
      },
    });

    // DEFINE EMAIL MESSAGE
    // All required fields for a complete email
    const mailOptions = {
      // Sender identity shown in "From" field
      from: `StrayCare System <${process.env.EMAIL_USER}>`,
      // Recipient email address
      to: toAddress,
      // Email subject line
      subject: emailSubject,
      // Email body (plain text format)
      text: emailText,
    };

    // SEND EMAIL
    // transporter.sendMail() handles SMTP communication with Gmail
    await transporter.sendMail(mailOptions);
    
    // Success logging
    console.log(`📧 Email successfully sent to: ${toAddress}`);
  } catch (error) {
    // ERROR HANDLING
    // Log error details for debugging
    // Doesn't crash the application - emails are not critical
    console.error("❌ Error sending email:", error.message);
    
    // In production, you might want to:
    // - Log to external error tracking (Sentry, Loggly)
    // - Store failed emails in database for retry
    // - Alert admin via Slack/Discord
  }
};

module.exports = sendEmail;
