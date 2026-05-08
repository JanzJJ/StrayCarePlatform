/**
 * ═
 * STRAYCARE EMAIL SENDING UTILITY
 ═
 *
 * Email Provider: Brevo
 *
 * Purpose:
 * This utility is used to send transactional emails from the StrayCare backend.
 * Examples:
 * - Adoption request emails
 * - Adoption confirmation emails
 * - Report notification emails
 * - Status update emails
 
 */



const sendEmail = async (optionsOrTo, subject, text) => {
  // Extract recipient email address/address list
  const toAddress =
    typeof optionsOrTo === "object" ? optionsOrTo.to : optionsOrTo;

  // Extract email subject
  const emailSubject =
    typeof optionsOrTo === "object" ? optionsOrTo.subject : subject;

  // Extract plain text email body
  const emailText =
    typeof optionsOrTo === "object" ? optionsOrTo.text : text;

  // Optional HTML email body, only used if passed in object format
  const emailHtml =
    typeof optionsOrTo === "object" ? optionsOrTo.html : null;

  /**
   * Basic validation checks.
   * If required data is missing, the email will not be sent.
   */

  if (!toAddress) {
    console.log("Email skipped: No recipient email address provided.");
    return;
  }

  if (!emailSubject) {
    console.log(" Email skipped: No email subject provided.");
    return;
  }

  if (!emailText && !emailHtml) {
    console.log("Email skipped: No email message content provided.");
    return;
  }

  if (!process.env.BREVO_API_KEY) {
    console.error(" Email failed: BREVO_API_KEY is missing from Render environment variables.");
    return;
  }

  /**
   * Sender email.
   *
   * First it checks Render environment variable BREVO_FROM_EMAIL.
   * If that is missing, it falls back to straycareplatform@gmail.com.
   */

  const senderEmail =
    process.env.BREVO_FROM_EMAIL || "straycareplatform@gmail.com";

  /**
   * Convert recipient into an array.
   *
   * This allows the function to support both:
   * - a single email string
   * - multiple emails in an array
   */

  const recipients = Array.isArray(toAddress) ? toAddress : [toAddress];

  try {
    /**
     * Send emails one by one.
     *
     * This is better than putting all recipients in one email because:
     * - recipients cannot see each other's email addresses
     * - it is safer for privacy
     * - it is better for transactional emails
     */

    for (const recipient of recipients) {
      const emailPayload = {
        sender: {
          name: "StrayCare",
          email: senderEmail,
        },
        to: [
          {
            email: recipient,
          },
        ],
        subject: emailSubject,
      };

      /**
       * Brevo allows either textContent or htmlContent.
       * If HTML is provided, use htmlContent.
       * Otherwise, use plain textContent.
       */

      if (emailHtml) {
        emailPayload.htmlContent = emailHtml;
      } else {
        emailPayload.textContent = emailText;
      }

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      const result = await response.json();

      /**
       * If Brevo rejects the email, log the full error.
       * This will help you debug the issue in Render logs.
       */

      if (!response.ok) {
        console.error(" Brevo email failed.");
        console.error("Recipient:", recipient);
        console.error("Status code:", response.status);
        console.error("Brevo error:", result);
        continue;
      }

      console.log(`📧 Email successfully sent via Brevo to: ${recipient}`);
    }
  } catch (error) {
    /**
     * This catches unexpected errors such as:
     * - network error
     * - invalid API request
     * - Render/backend runtime issue
     */

    console.error(" Unexpected error while sending email via Brevo.");
    console.error("Error message:", error.message);
  }
};

module.exports = sendEmail;