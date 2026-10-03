import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { sendClinicInquiryEmail } from "@/lib/email/inquiry-email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce strict rate limiting (max 5 contact submissions per 10 min per IP)
    const rateCheck = await checkRateLimit(req, "contact_inquiry", {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many submissions. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, phone, email, message, turnstile_token } = body;

    // 2. CAPTCHA verification (Cloudflare Turnstile)
    const turnstileCheck = await verifyTurnstileToken(turnstile_token, req);
    if (!turnstileCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: turnstileCheck.error || "Security verification failed. Please try again.",
        },
        { status: 403 }
      );
    }

    // 3. Input Validation
    const cleanName = (name || "").trim();
    const cleanPhone = (phone || "").replace(/[^0-9+]/g, "").trim();
    const cleanMessage = (message || "").trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 11-digit mobile phone number." },
        { status: 400 }
      );
    }

    if (!cleanMessage || cleanMessage.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please enter your message or question (minimum 5 characters)." },
        { status: 400 }
      );
    }

    if (cleanEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid email address format." },
          { status: 400 }
        );
      }
    }

    const recordId = `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const inquiryRecord = {
      id: recordId,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      message: cleanMessage,
      status: "unread",
      created_at: nowIso,
    };

    // 4. Record to Supabase Database
    if (isSupabaseConfigured) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        const { error: dbError } = await supabaseAdmin
          .from("contact_inquiries")
          .insert(inquiryRecord);

        if (dbError) {
          console.warn("Contact inquiry database insert notice:", dbError.message);
          // If table doesn't exist yet, we still proceed to send email notification
        }
      } catch (err) {
        console.warn("Supabase insert exception (non-fatal):", err);
      }
    }

    // 5. Send automated clinic notification email in background
    sendClinicInquiryEmail({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail || undefined,
      message: cleanMessage,
    }).catch((emailErr) => {
      console.warn("Background inquiry email notification failed (non-fatal):", emailErr);
    });

    return NextResponse.json({
      success: true,
      inquiry: inquiryRecord,
      message: "Thank you! Your message has been received. Our clinical coordinator will contact you shortly.",
    });
  } catch (err: any) {
    console.error("Unhandled contact submission error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please call our hotline directly." },
      { status: 500 }
    );
  }
}
