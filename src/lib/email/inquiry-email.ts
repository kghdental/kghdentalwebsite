import nodemailer from "nodemailer";
import { getSmtpConfig } from "@/lib/email/appointment-email";

export interface EmailInquiryPayload {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

export async function sendClinicInquiryEmail(payload: EmailInquiryPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const config = getSmtpConfig();

    if (!config.isConfigured) {
      console.warn("[Email Notification] SMTP credentials not set; skipping inquiry notification.");
      return { success: false, error: "SMTP not configured" };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const recipient = config.fallbackEmail || "kghdentalbanani@gmail.com";
    const cleanPhone = payload.phone.replace(/[^0-9+]/g, "");
    const waLink = `https://wa.me/${cleanPhone.startsWith("+") ? cleanPhone.replace("+", "") : "88" + cleanPhone.replace(/^0/, "")}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c1c1e; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e5ea; }
          .header { background: #1c362b; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 0; font-size: 13px; opacity: 0.85; }
          .content { padding: 28px 24px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .info-table td { padding: 12px 8px; border-bottom: 1px solid #f2f2f7; font-size: 14px; }
          .info-table td.label { font-weight: 600; color: #636366; width: 35%; }
          .info-table td.value { font-weight: 500; color: #1c1c1e; }
          .message-box { background: #f9f9fb; border-left: 4px solid #1c362b; padding: 16px; border-radius: 0 12px 12px 0; margin-bottom: 24px; font-size: 14px; line-height: 1.6; color: #2c2c2e; }
          .actions { text-align: center; margin-top: 24px; }
          .btn { display: inline-block; padding: 12px 24px; background: #1c362b; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600; margin: 0 6px 8px; }
          .btn-wa { background: #25d366; }
          .footer { background: #f2f2f7; padding: 16px 24px; text-align: center; font-size: 11px; color: #8e8e93; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📩 New Patient Inquiry</h1>
            <p>A visitor submitted an inquiry from the KGH Dental Contact Page</p>
          </div>
          <div class="content">
            <table class="info-table">
              <tr>
                <td class="label">Patient / Lead Name:</td>
                <td class="value"><strong>${payload.name}</strong></td>
              </tr>
              <tr>
                <td class="label">Phone Number:</td>
                <td class="value"><a href="tel:${payload.phone}" style="color: #1c362b; font-weight: 600;">${payload.phone}</a></td>
              </tr>
              ${payload.email ? `
              <tr>
                <td class="label">Email Address:</td>
                <td class="value"><a href="mailto:${payload.email}" style="color: #1c362b;">${payload.email}</a></td>
              </tr>` : ""}
              <tr>
                <td class="label">Received At:</td>
                <td class="value">${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })} (Dhaka Time)</td>
              </tr>
            </table>

            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #636366; margin-bottom: 6px;">
              Patient's Message:
            </div>
            <div class="message-box">
              ${payload.message.replace(/\n/g, "<br>")}
            </div>

            <div class="actions">
              <a href="tel:${cleanPhone}" class="btn">📞 Call Patient</a>
              <a href="${waLink}" class="btn btn-wa" target="_blank">💬 WhatsApp</a>
              <a href="${config.siteUrl}/admin/inquiries" class="btn">Open Admin Panel</a>
            </div>
          </div>
          <div class="footer">
            KGH Dental Care • Banani, Dhaka • Automated Lead Notification
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.user}>`,
      to: recipient,
      replyTo: payload.email || undefined,
      subject: `[New Inquiry] ${payload.name} — ${payload.phone}`,
      html: htmlContent,
      text: `New Patient Inquiry\n\nName: ${payload.name}\nPhone: ${payload.phone}\nEmail: ${payload.email || "N/A"}\n\nMessage:\n${payload.message}\n\nManage in Admin: ${config.siteUrl}/admin/inquiries`,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("sendClinicInquiryEmail error:", err);
    return { success: false, error: err.message };
  }
}
