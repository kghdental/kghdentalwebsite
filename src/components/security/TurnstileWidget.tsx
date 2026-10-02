"use client";

import React, { useEffect, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error?: any) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = "light",
  className = "",
}: TurnstileWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  useEffect(() => {
    setMounted(true);
    // If site key is not configured yet (local dev mode), auto-pass verification
    if (!siteKey) {
      onSuccess("dev-bypass-token");
    }
  }, [siteKey, onSuccess]);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center p-3 text-xs text-zinc-500 ${className}`}>
        <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin mr-2" />
        Initializing security check...
      </div>
    );
  }

  // Fallback badge if Cloudflare site key has not been configured in .env yet
  if (!siteKey) {
    return (
      <div
        className={`flex items-center gap-2 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 ${className}`}
      >
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Security:</strong> Bot protection ready (Awaiting Turnstile Site Key in .env)
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center my-2 ${className}`}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={(err) => {
          console.error("Turnstile verification error:", err);
          if (onError) onError(err);
        }}
        onExpire={() => {
          if (onExpire) onExpire();
        }}
        options={{
          theme,
          size: "normal",
        }}
      />
    </div>
  );
}
