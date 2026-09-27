"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Building2,
  BookOpen,
  Image as ImageIcon,
  FolderOpen,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Database,
  ShieldAlert,
  Star,
  Layers,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchLiveAppointments } from "@/lib/api/db";
import { getReadAppointmentRefs } from "@/lib/appointment-utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadAppointmentsCount, setUnreadAppointmentsCount] = useState<number>(0);

  // Track unread appointments count across admin panel
  useEffect(() => {
    const computeUnread = async () => {
      try {
        const readRefs = getReadAppointmentRefs();
        const live = await fetchLiveAppointments();
        const allApps = live || [];
        const unread = allApps.filter(
          (a) => !readRefs.includes(a.reference_code) && !readRefs.includes(a.id)
        ).length;
        setUnreadAppointmentsCount(unread);
      } catch (err) {
        // ignore
      }
    };

    computeUnread();

    const handleUpdate = () => {
      computeUnread();
    };

    window.addEventListener("kgh_appointments_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("kgh_appointments_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Verify active session with database on every admin page transition
  useEffect(() => {
    if (pathname === "/admin/login") return;

    let isMounted = true;
    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (!res.ok && isMounted) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("kgh_admin_auth");
            window.location.href = "/admin/login";
          }
        }
      } catch {
        // Network failure or offline
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // If on login page, render children without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
    { href: "/admin/doctors", label: "Doctors Directory", icon: Users },
    { href: "/admin/departments", label: "Departments & 64 Services", icon: Building2 },
    { href: "/admin/reviews", label: "Patient Reviews", icon: Star },
    { href: "/admin/homepage", label: "Homepage Sections", icon: Layers },
    { href: "/admin/blog", label: "Blog Articles (10)", icon: BookOpen },
    { href: "/admin/gallery", label: "Gallery Showcase", icon: ImageIcon },
    { href: "/admin/media", label: "Media Library", icon: FolderOpen },
    { href: "/admin/settings", label: "Clinic Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-zinc-950 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <img
            src="/images/logos/kgh-logo-white.png"
            alt="KGH Dental Admin"
            className="h-7 w-auto"
          />
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
            Admin CMS
          </span>
          {unreadAppointmentsCount > 0 && (
            <Link
              href="/admin/appointments"
              className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold animate-pulse"
            >
              {unreadAppointmentsCount} New
            </Link>
          )}
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-72 bg-zinc-950 text-white flex flex-col justify-between p-5 transition-transform duration-300 shadow-2xl lg:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-zinc-800">
            <Link href="/admin" className="flex items-center gap-2.5">
              <img
                src="/images/logos/kgh-logo-white.png"
                alt="KGH Dental Admin"
                className="h-8 w-auto"
              />
            </Link>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              CMS v1.0
            </span>
          </div>

          {/* Database Status Indicator */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-300">Database:</span>
            </div>
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Local Safe Mode
              </span>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-zinc-950 font-bold shadow-xs"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.href === "/admin/appointments" && unreadAppointmentsCount > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold tracking-wide animate-pulse shadow-xs"
                      title={`${unreadAppointmentsCount} new unread appointments`}
                    >
                      {unreadAppointmentsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-5 border-t border-zinc-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>View Public Website</span>
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md">Live</span>
          </Link>

          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch {
                // ignore
              }
              if (typeof window !== "undefined") {
                localStorage.removeItem("kgh_admin_auth");
              }
              window.location.href = "/admin/login";
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
