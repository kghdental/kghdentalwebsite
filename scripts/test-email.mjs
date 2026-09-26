import nodemailer from "nodemailer";

/**
 * Quick SMTP Test Script for KGH Dental Email Notifications
 * Run with: node --env-file=.env.local scripts/test-email.mjs
 */
async function main() {
  console.log("\n=======================================================");
  console.log("  KGH Dental Care — Automated Gmail SMTP Verification");
  console.log("=======================================================\n");

  const user =
    process.env.SMTP_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    "";
  const rawPass =
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    "";
  const pass = rawPass.replace(/\s+/g, "");
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const fromName = process.env.SMTP_FROM_NAME || "KGH Dental Care";
  const fallbackEmail =
    process.env.NOTIFICATION_FALLBACK_EMAIL ||
    user ||
    "kghdentalbanani@gmail.com";

  console.log(`[Config Check]`);
  console.log(`- SMTP Host: ${host}:${port} (SSL: ${secure})`);
  console.log(`- SMTP User: ${user || "(NOT SET)"}`);
  console.log(`- App Password: ${pass ? "******** (" + pass.length + " chars)" : "(NOT SET)"}`);
  console.log(`- Notification Recipient: ${fallbackEmail}`);

  if (!user || !pass) {
    console.error(
      "\n❌ ERROR: SMTP credentials missing! Please configure SMTP_EMAIL and SMTP_PASSWORD in .env.local.\n"
    );
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
  });

  console.log("\n⏳ Verifying connection to Gmail SMTP server...");
  try {
    await transporter.verify();
    console.log("✅ Connection successfully authenticated with Gmail!");
  } catch (verifyErr) {
    console.error("\n❌ Authentication failed with Gmail SMTP server!");
    console.error("Details:", verifyErr.message);
    console.log("\nTroubleshooting tips:");
    console.log("1. Ensure 2-Step Verification is enabled on your Google account.");
    console.log("2. Use a 16-character Google 'App Password', NOT your standard Gmail password.");
    console.log("3. Verify the email address matches the account that generated the App Password.\n");
    process.exit(1);
  }

  const testSubject = `[KGH Dental System Test] Booking Alert Verification (${new Date().toLocaleTimeString()})`;
  const testHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
      <div style="background: #0F172A; padding: 24px; text-align: center; color: #FFFFFF;">
        <h2 style="margin: 0; font-size: 20px;">KGH DENTAL CARE</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">Automated Notification System Verification</p>
      </div>
      <div style="padding: 24px; color: #1F2937;">
        <h3 style="color: #059669; margin-top: 0;">🎉 SMTP Connection Successful!</h3>
        <p>This is a verified test email dispatched directly through <strong>${user}</strong> using Google App Password.</p>
        <div style="background: #F8FAFC; border-left: 4px solid #059669; padding: 14px; border-radius: 8px; margin: 16px 0;">
          <strong>Configuration Verified:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">
            <li>Service: Google SMTP (smtp.gmail.com:465)</li>
            <li>Sender: ${user}</li>
            <li>Status: Ready to dispatch real patient appointment alerts</li>
          </ul>
        </div>
        <p style="font-size: 13px; color: #64748B;">
          Whenever a patient books an appointment via the KGH Dental website, both the specialist doctor and this clinic inbox will automatically receive the full booking details.
        </p>
      </div>
      <div style="background: #F8FAFC; padding: 16px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0;">
        KGH Dental Care • Smart Chamber Management Engine
      </div>
    </div>
  `;

  console.log(`\n⏳ Dispatching test appointment notification to ${fallbackEmail}...`);
  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: fallbackEmail,
      subject: testSubject,
      text: "KGH Dental Care SMTP test successful! Appointment alerts are ready.",
      html: testHtml,
    });

    console.log("✅ Email dispatched successfully!");
    console.log(`- Message ID: ${info.messageId}`);
    console.log(`- Delivered to: ${fallbackEmail}`);
    console.log("\n=======================================================");
    console.log("  🎉 ALL CHECKS PASSED: Your email system is fully live!");
    console.log("=======================================================\n");
  } catch (sendErr) {
    console.error("\n❌ Failed to send email!");
    console.error("Details:", sendErr.message);
    process.exit(1);
  }
}

main();
