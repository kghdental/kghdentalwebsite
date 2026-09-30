export interface SessionUser {
  email: string;
  name: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
}

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Returns the secret key for HMAC token signing.
 */
function getSigningSecret(): string {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: ADMIN_SECRET_KEY must be set in production environment variables."
      );
    }
    // Secure fallback for local development only
    return "kgh_dev_ephemeral_hmac_secret_key_32bytes_min!";
  }
  return secret;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const secretBytes = enc.encode(getSigningSecret());
  return await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token using Web Crypto API.
 * Compatible with Edge Runtime and Node.js.
 */
export async function createSignedSessionToken(user: {
  email: string;
  name?: string;
  role?: string;
}): Promise<string> {
  const now = Date.now();
  const payload: SessionUser = {
    email: user.email.toLowerCase().trim(),
    name: user.name || "Admin",
    role: user.role || "super_admin",
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_MS,
  };

  const enc = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = base64UrlEncode(enc.encode(payloadJson));

  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadBase64)
  );
  const signatureBase64 = base64UrlEncode(signatureBuffer);

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies the HMAC-SHA256 session token using Web Crypto API.
 * Returns the verified user session, or null if invalid or expired.
 */
export async function verifySignedSessionToken(
  token: string | undefined
): Promise<SessionUser | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length === 2) {
    const [payloadBase64, signatureBase64] = parts;
    try {
      const key = await getHmacKey();
      const enc = new TextEncoder();
      const sigBytes = base64UrlDecode(signatureBase64);
      const dataBytes = enc.encode(payloadBase64);

      const isValid = await crypto.subtle.verify(
        "HMAC",
        key,
        sigBytes as unknown as BufferSource,
        dataBytes as unknown as BufferSource
      );

      if (!isValid) return null;

      const dec = new TextDecoder();
      const payloadJson = dec.decode(base64UrlDecode(payloadBase64));
      const payload: SessionUser = JSON.parse(payloadJson);

      if (!payload.email || !payload.expiresAt) return null;
      if (Date.now() > payload.expiresAt) return null;

      return payload;
    } catch {
      return null;
    }
  }

  // Graceful legacy migration fallback
  try {
    const decoded = atob(token);
    const [email, timestamp, legacySecret] = decoded.split(":");
    const expectedSecret = process.env.ADMIN_SECRET_KEY || "kgh_dental_secret_2026";
    const tokenAge = Date.now() - Number(timestamp);

    if (
      email &&
      legacySecret === expectedSecret &&
      !isNaN(tokenAge) &&
      tokenAge > 0 &&
      tokenAge < SESSION_MAX_AGE_MS
    ) {
      return {
        email,
        name: "Admin",
        role: "super_admin",
        issuedAt: Number(timestamp),
        expiresAt: Number(timestamp) + SESSION_MAX_AGE_MS,
      };
    }
  } catch {
    // Ignore legacy decode failure
  }

  return null;
}
