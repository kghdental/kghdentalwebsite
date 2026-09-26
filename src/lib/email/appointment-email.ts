import nodemailer from "nodemailer";

export interface EmailAppointmentPayload {
  reference_code: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  patient_age?: string;
  patient_gender?: string;
  doctor_id?: string;
  doctor_name: string;
  doctor_email?: string;
  department_name?: string;
  appointment_date: string;
  time_slot: string;
  symptoms?: string;
}

/**
 * Reads and resolves SMTP credentials from environment variables.
 * Supports standard SMTP_* and GMAIL_* naming patterns.
 */
export function getSmtpConfig() {
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
    process.env.ADMIN_EMAIL ||
    user ||
    "kghdentalbanani@gmail.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kghdental.com";

  const isConfigured = Boolean(user && pass);

  return {
    user,
    pass,
    host,
    port,
    secure,
    fromName,
    fallbackEmail,
    siteUrl,
    isConfigured,
  };
}

/**
 * Creates a configured Nodemailer transporter with cloud & serverless timeout resilience.
 */
export function createEmailTransporter() {
  const config = getSmtpConfig();

  if (!config.isConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    // Serverless-friendly connection timeouts (avoid hanging execution)
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 15000, // 15 seconds
  });
}

/**
 * Generates an executive, responsive, modern HTML email template for doctors & clinic staff.
 */
export function generateDoctorAppointmentEmailHtml(
  data: EmailAppointmentPayload,
  siteUrl: string = "https://kghdental.com"
): string {
  const adminAppointmentUrl = `${siteUrl.replace(/\/$/, "")}/admin/appointments`;
  const sanitizedPhone = data.patient_phone.replace(/[^\d+]/g, "");
  const whatsappUrl = `https://wa.me/88${sanitizedPhone.replace(/^(\+88|88)/, "")}`;

  const formattedDate = (() => {
    try {
      const parts = data.appointment_date.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      return data.appointment_date;
    } catch {
      return data.appointment_date;
    }
  })();

  const ageGenderDisplay = [
    data.patient_age ? `${data.patient_age} yrs` : null,
    data.patient_gender || null,
  ]
    .filter(Boolean)
    .join(" • ");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Appointment: ${data.patient_name} - KGH Dental</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #F4F5F7;
      color: #1F2937;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F4F5F7;
      padding: 32px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #E5E7EB;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      padding: 28px 32px;
      text-align: center;
      color: #FFFFFF;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 0;
      color: #FFFFFF;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      color: #94A3B8;
      letter-spacing: 1px;
      margin-top: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .alert-badge {
      display: inline-block;
      margin-top: 14px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34D399;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .body {
      padding: 32px;
    }
    .greeting {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
    }
    .schedule-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #059669;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .schedule-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 800;
      color: #059669;
      margin-bottom: 8px;
    }
    .schedule-main {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }
    .schedule-slot {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      margin-top: 4px;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 800;
      color: #64748B;
      margin-bottom: 12px;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 6px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .info-table td {
      padding: 9px 0;
      font-size: 13px;
      vertical-align: top;
      border-bottom: 1px solid #F8FAFC;
    }
    .info-label {
      width: 36%;
      color: #64748B;
      font-weight: 600;
    }
    .info-val {
      width: 64%;
      color: #0F172A;
      font-weight: 700;
    }
    .ref-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #059669;
      background: #ECFDF5;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      display: inline-block;
    }
    .complaint-box {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 28px;
    }
    .complaint-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 800;
      color: #B45309;
      margin-bottom: 6px;
    }
    .complaint-text {
      font-size: 13px;
      color: #78350F;
      margin: 0;
      font-style: italic;
      line-height: 1.4;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 10px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #0F172A;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      padding: 13px 28px;
      border-radius: 10px;
      margin: 4px;
      letter-spacing: 0.3px;
    }
    .btn-secondary {
      display: inline-block;
      background-color: #10B981;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      padding: 13px 24px;
      border-radius: 10px;
      margin: 4px;
      letter-spacing: 0.3px;
    }
    .footer {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 24px 32px;
      text-align: center;
      font-size: 11px;
      color: #64748B;
      line-height: 1.6;
    }
    .footer-clinic {
      font-weight: 700;
      color: #334155;
      font-size: 12px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <h1 class="brand-title">KGH DENTAL CARE</h1>
        <div class="brand-sub">Specialized Multi-Specialty Dental Clinic</div>
        <div class="alert-badge">New Appointment Notification</div>
      </div>

      <!-- BODY -->
      <div class="body">
        <p class="greeting">
          Dear <strong>${data.doctor_name}</strong>,
        </p>
        <p style="font-size: 13px; color: #475569; margin-top: -10px; margin-bottom: 20px;">
          A new patient consultation has just been booked for you through the KGH Dental smart reservation system.
        </p>

        <!-- SCHEDULE BOX -->
        <div class="schedule-box">
          <div class="schedule-title">Consultation Schedule</div>
          <div class="schedule-main">${formattedDate}</div>
          <div class="schedule-slot">Time Slot: ${data.time_slot}</div>
        </div>

        <!-- APPOINTMENT DETAILS TABLE -->
        <div class="section-title">Patient Profile & Contact</div>
        <table class="info-table">
          <tr>
            <td class="info-label">Reference ID:</td>
            <td class="info-val"><span class="ref-code">#${data.reference_code}</span></td>
          </tr>
          <tr>
            <td class="info-label">Patient Name:</td>
            <td class="info-val">${data.patient_name}</td>
          </tr>
          <tr>
            <td class="info-label">Contact Phone:</td>
            <td class="info-val">
              <a href="tel:${data.patient_phone}" style="color: #0F172A; text-decoration: none;">
                ${data.patient_phone}
              </a>
            </td>
          </tr>
          ${
            ageGenderDisplay
              ? `<tr>
            <td class="info-label">Demographics:</td>
            <td class="info-val">${ageGenderDisplay}</td>
          </tr>`
              : ""
          }
          ${
            data.patient_email
              ? `<tr>
            <td class="info-label">Patient Email:</td>
            <td class="info-val">${data.patient_email}</td>
          </tr>`
              : ""
          }
          <tr>
            <td class="info-label">Specialist:</td>
            <td class="info-val">${data.doctor_name}</td>
          </tr>
          ${
            data.department_name
              ? `<tr>
            <td class="info-label">Department:</td>
            <td class="info-val">${data.department_name}</td>
          </tr>`
              : ""
          }
        </table>

        <!-- CHIEF COMPLAINT (IF PROVIDED) -->
        ${
          data.symptoms
            ? `
        <div class="complaint-box">
          <div class="complaint-title">Reported Dental Concern / Symptoms</div>
          <p class="complaint-text">"${data.symptoms}"</p>
        </div>
        `
            : ""
        }

        <!-- ACTIONS -->
        <div class="btn-container">
          <a href="${adminAppointmentUrl}" class="btn-primary" target="_blank">
            Open in Admin Dashboard
          </a>
          <a href="${whatsappUrl}" class="btn-secondary" target="_blank">
            WhatsApp Patient
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-clinic">KGH Dental Care — Multi-Specialty Dental Clinic</div>
        <div>Dhaka, Bangladesh • Smart Chamber Management Engine</div>
        <div style="margin-top: 8px; color: #94A3B8; font-size: 10px;">
          This is an automated notification dispatched upon online booking confirmation.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates a clean plain text fallback for clients that do not render HTML.
 */
export function generateDoctorAppointmentEmailText(data: EmailAppointmentPayload): string {
  return `
KGH DENTAL CARE — NEW APPOINTMENT NOTIFICATION
==================================================

Dear ${data.doctor_name},

A new patient appointment has been reserved for you:

Appointment Schedule:
- Date: ${data.appointment_date}
- Time Slot: ${data.time_slot}
- Reference Code: #${data.reference_code}

Patient Details:
- Name: ${data.patient_name}
- Phone: ${data.patient_phone}
${data.patient_age ? `- Age: ${data.patient_age} yrs\n` : ""}${data.patient_gender ? `- Gender: ${data.patient_gender}\n` : ""}${
    data.patient_email ? `- Email: ${data.patient_email}\n` : ""
}- Department: ${data.department_name || "Specialist Consultation"}
${data.symptoms ? `\nChief Complaint / Symptoms:\n"${data.symptoms}"\n` : ""}
Admin Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || "https://kghdental.com"}/admin/appointments

--
KGH Dental Care
Automated Notification Service
  `.trim();
}

/**
 * High-level service function to send the appointment email.
 * Gracefully handles unconfigured SMTP (returns simulated success in dev).
 */
export async function sendDoctorAppointmentEmail(data: EmailAppointmentPayload): Promise<{
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  recipient?: string;
  error?: string;
}> {
  const config = getSmtpConfig();

  // Determine recipient email:
  // 1. Doctor's direct email
  // 2. Or fallback to clinic notification email
  const recipient = data.doctor_email?.trim() || config.fallbackEmail;

  if (!recipient) {
    return {
      success: false,
      error: "No recipient email address could be resolved for this doctor or clinic.",
    };
  }

  // If SMTP is not yet configured with real credentials (e.g. initial setup)
  if (!config.isConfigured) {
    console.info(
      `[Appointment Email Service: SIMULATED] SMTP credentials not set in .env.local. Email would be dispatched to: ${recipient} for appointment #${data.reference_code}`
    );
    return {
      success: true,
      simulated: true,
      recipient,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      throw new Error("Failed to initialize mail transporter");
    }

    const htmlContent = generateDoctorAppointmentEmailHtml(data, config.siteUrl);
    const textContent = generateDoctorAppointmentEmailText(data);

    // CC the clinic reception if the recipient is the doctor's personal email
    const ccList =
      data.doctor_email &&
      config.fallbackEmail &&
      data.doctor_email.toLowerCase() !== config.fallbackEmail.toLowerCase()
        ? [config.fallbackEmail]
        : undefined;

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.user}>`,
      to: recipient,
      cc: ccList,
      subject: `[KGH Dental] New Appointment: ${data.patient_name} (${data.appointment_date} @ ${data.time_slot})`,
      text: textContent,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: info.messageId,
      recipient,
    };
  } catch (err: unknown) {
    console.error("sendDoctorAppointmentEmail error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to dispatch email notification";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
