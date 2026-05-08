/**
 
 * EMAIL SENDING UTILITY
 
 * This utility sends transactional emails to users and organizations
 
  
 * Email Provider Options:
 * 1. Gmail SMTP (current) - works but less reliable on production
 * 2. Resend (recommended for production) - https://resend.com
 
 * Environment Variables Required:
 * Gmail option:
 * - EMAIL_USER: Gmail address
 * - EMAIL_PASS: Gmail App Password
 * 
 * Resend option (better):
 * - RESEND_API_KEY: API key from Resend
 
 */

const nodemailer = require("nodemailer");

// Try to use Resend if API key available, fall back to Gmail
const useResend = !!process.env.RESEND_API_KEY;

/**
 * Sends an email to specified recipient
 */
const sendEmail = async (optionsOrTo, subject, text) => {
  // FLEXIBLE INPUT PARSING
  const toAddress =
    typeof optionsOrTo === "object" ? optionsOrTo.to : optionsOrTo;
  const emailSubject =
    typeof optionsOrTo === "object" ? optionsOrTo.subject : subject;
  const emailText = typeof optionsOrTo === "object" ? optionsOrTo.text : text;

  if (!toAddress) {
    console.log(
      "⚠️ Skipped sending email: No recipient email address provided.",
    );
    return;
  }

  try {
    if (useResend) {
      // ─── RESEND METHOD (Production recommended) ────────────────────
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const result = await resend.emails.send({
        from: "nethmajanuki@gmail.com",
        to: toAddress,
        subject: emailSubject,
        text: emailText,
      });

      if (result.error) {
        console.error("❌ Resend error:", result.error);
      } else {
        console.log(`📧 Email successfully sent via Resend to: ${toAddress}`);
      }
    } else {
      // ─── GMAIL METHOD (Fallback) ──────────────────────────────────
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error(
          "❌ EMAIL_USER or EMAIL_PASS environment variables not set",
        );
        return;
      }

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `StrayCare System <${process.env.EMAIL_USER}>`,
        to: toAddress,
        subject: emailSubject,
        text: emailText,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Email successfully sent via Gmail to: ${toAddress}`);
    }
  } catch (error) {
    console.error("❌ Error sending email to:", toAddress);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);

    if (error.code === "EAUTH") {
      console.error(
        "🔐 GMAIL AUTH FAILED - Check EMAIL_USER and EMAIL_PASS are correct",
      );
      console.error(
        "   Use Gmail App Password from: https://myaccount.google.com/apppasswords",
      );
    }
    if (error.code === "ECONNREFUSED") {
      console.error(
        "🌐 CONNECTION REFUSED - Check firewall/network settings on Render",
      );
    }
    if (error.code === "ETIMEDOUT") {
      console.error(
        "⏱️ CONNECTION TIMEOUT - Gmail/Resend server not responding",
      );
    }
  }
};

module.exports = sendEmail;
