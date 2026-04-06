"use strict";

const Administrator = require("../../models/Administrator");
const User = require("../../models/User");
const mailGenerator = require("../../config/mail");
const { sendMail } = require("./MailService");
const birthdayMail = require("../../resources/mails/birthdayMail");

/**
 * Fetch the email addresses of all active administrators.
 */
const getAdminEmails = async () => {
    const admins = await Administrator.findAll({
        include: [{ model: User, as: "user", attributes: ["email"] }],
    });
    return admins.map((a) => a.user.email).filter(Boolean);
};

const send = async (members, date) => {
    const dateStr = date.format("DD MMMM YYYY");

    const birthdayRows = members.map((m) => ({
        name: m.user.name,
        phoneNumber: m.user.phoneNumber || null,
    }));

    const adminEmails = await getAdminEmails();

    if (adminEmails.length === 0) {
        console.warn("[BirthdayNotifier] No admin emails found — skipping.");
        return;
    }

    const mailTemplate = birthdayMail(dateStr, birthdayRows);
    const emailBody = mailGenerator.generate(mailTemplate);

    const subject = `🎂 Birthday Digest — ${dateStr}`;

    // Send to each admin individually so delivery failures are isolated
    const results = await Promise.allSettled(
        adminEmails.map((email) => sendMail(email, subject, emailBody))
    );

    results.forEach((result, i) => {
        if (result.status === "rejected") {
            console.error(`[BirthdayNotifier] Failed to send to ${adminEmails[i]}:`, result.reason?.message);
        } else {
            console.log(`[BirthdayNotifier] Sent to ${adminEmails[i]}`);
        }
    });
};

module.exports = { send };

