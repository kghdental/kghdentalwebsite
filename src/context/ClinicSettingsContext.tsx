"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ClinicSettings } from "@/types";
import { CLINIC_SETTINGS } from "@/data/settings";
import { fetchLiveClinicSettings, saveLiveClinicSettings } from "@/lib/api/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface ClinicSettingsContextType {
  settings: ClinicSettings;
  isLoading: boolean;
  updateSettings: (newSettings: ClinicSettings) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const ClinicSettingsContext = createContext<ClinicSettingsContextType>({
  settings: CLINIC_SETTINGS,
  isLoading: false,
  updateSettings: async () => false,
  refreshSettings: async () => {},
});

export function ClinicSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ClinicSettings>(CLINIC_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Initial hydration and live sync
  useEffect(() => {
    let isMounted = true;

    // Fast synchronous read from localStorage for zero flash of default content
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("kgh_live_clinic_settings");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object") {
            setSettings((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch {
        // ignore
      }
    }

    // Live fetch from Supabase
    fetchLiveClinicSettings().then((liveData) => {
      if (isMounted && liveData) {
        setSettings(liveData);
        setIsLoading(false);
      }
    });

    // 2. Intra-tab live event listener
    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<ClinicSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        fetchLiveClinicSettings().then((s) => {
          if (isMounted && s) setSettings(s);
        });
      }
    };

    // 3. Cross-tab storage event listener
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "kgh_live_clinic_settings") {
        fetchLiveClinicSettings().then((s) => {
          if (isMounted && s) setSettings(s);
        });
      }
    };

    window.addEventListener("kgh_settings_updated", handleSettingsUpdated);
    window.addEventListener("storage", handleStorage);

    // 4. Supabase Realtime channel subscription (if connected)
    let channel: any = null;
    if (isSupabaseConfigured) {
      try {
        channel = supabase
          .channel("realtime_clinic_settings")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "clinic_settings" },
            () => {
              fetchLiveClinicSettings().then((s) => {
                if (isMounted && s) setSettings(s);
              });
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("Supabase realtime subscription failed:", err);
      }
    }

    return () => {
      isMounted = false;
      window.removeEventListener("kgh_settings_updated", handleSettingsUpdated);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const updateSettings = async (newSettings: ClinicSettings): Promise<boolean> => {
    setSettings(newSettings);
    const result = await saveLiveClinicSettings(newSettings);
    return result.success;
  };

  const refreshSettings = async (): Promise<void> => {
    setIsLoading(true);
    const live = await fetchLiveClinicSettings();
    if (live) setSettings(live);
    setIsLoading(false);
  };

  return (
    <ClinicSettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </ClinicSettingsContext.Provider>
  );
}

export function useClinicSettings() {
  const context = useContext(ClinicSettingsContext);
  if (!context) {
    throw new Error("useClinicSettings must be used within a ClinicSettingsProvider");
  }
  return context;
}
