const nodemailer = require("nodemailer");
const Postal = require("@atech/postal");

// SMTP Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

exports.sendMail = async (recipient, subject, emailBody) => {
  try {
    const fromEmailAddress = `"ayo" <${process.env.EMAIL_FROM}>`;
    if (process.env.EMAIL_SERVER === "postal") {
      const client = new Postal.Client(
        process.env.POSTAL_USER,
        process.env.POSTAL_SECRET
      );

      const message = new Postal.SendMessage(client);

      // Add recipients
      message.to(recipient);

      // Specify the sender (must be from a verified domain)
      message.from(fromEmailAddress);
      // Set the subject of the email
      message.subject(subject);

      // Set the email content (both plain text and HTML)
      message.plainBody(emailBody);
      message.htmlBody(emailBody);

      try {
        // Send the email and log the results
        const result = await message.send();
        const recipients = result.recipients();

        // Log message IDs and tokens for each recipient
        // for (const email in recipients) {
        //   const recipient = recipients[email];
        //   console.log("Message ID:", recipient.id()); // Logs message ID
        //   console.log("Message Token:", recipient.token()); // Logs message token
        // }
        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    } else {
      return transporter.sendMail({
        from: fromEmailAddress,
        to: recipient,
        subject,
        html: emailBody
      });
    }
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw error; // Re-throw the error for the caller to handle
  }
};
