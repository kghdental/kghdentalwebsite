import { NextRequest } from "next/server";
import { getClientIp } from "./rate-limiter";

export interface TurnstileVerificationResult {
  success: boolean;
  bypassed?: boolean;
  error?: string;
  errorCodes?: string[];
}

/**
 * Verifies a Cloudflare Turnstile captcha token server-side.
 * 
 * If TURNSTILE_SECRET_KEY is not configured in environment variables,
 * it will gracefully bypass verification (safe for local development or until keys are configured).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  req?: NextRequest | Request
): Promise<TurnstileVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  // If secret key is not set, log development warning and bypass safely
  if (!secretKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️ [Turnstile] TURNSTILE_SECRET_KEY is not configured in .env.local. Bypassing CAPTCHA check for local development."
      );
    }
    return { success: true, bypassed: true };
  }

  // If secret key is set, token is strictly required
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      error: "CAPTCHA verification token is missing. Please complete the security verification.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());

    if (req) {
      const clientIp = getClientIp(req);
      if (clientIp && clientIp !== "127.0.0.1") {
        formData.append("remoteip", clientIp);
      }
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.error(`[Turnstile] Verification endpoint returned HTTP ${response.status}`);
      return {
        success: false,
        error: "Unable to verify CAPTCHA with Cloudflare. Please try again.",
      };
    }

    const outcome = await response.json();

    if (outcome.success) {
      return { success: true };
    }

    console.warn("[Turnstile] Validation failed:", outcome["error-codes"]);
    return {
      success: false,
      error: "Security verification failed. Please try again.",
      errorCodes: outcome["error-codes"],
    };
  } catch (err) {
    console.error("[Turnstile] Verification request error:", err);
    return {
      success: false,
      error: "Security verification service unreachable. Please try again later.",
    };
  }
}
