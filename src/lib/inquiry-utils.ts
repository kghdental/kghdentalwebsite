import { ContactInquiry } from "@/types";

export const READ_INQUIRIES_STORAGE_KEY = "kgh_read_inquiry_ids";

/**
 * Exports contact inquiries to a UTF-8 BOM CSV for direct Microsoft Excel compatibility.
 */
export function exportInquiriesToCSV(
  inquiries: ContactInquiry[],
  filename = `KGH_Patient_Inquiries_${new Date().toISOString().split("T")[0]}.csv`
) {
  const headers = [
    "Inquiry ID",
    "Patient / Lead Name",
    "Phone Number",
    "Email Address",
    "Status",
    "Inquiry Message",
    "Admin Notes",
    "Date Received",
  ];

  const escapeCSV = (val?: string | null) => {
    if (!val) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = inquiries.map((inq) => [
    escapeCSV(inq.id),
    escapeCSV(inq.name),
    escapeCSV(inq.phone),
    escapeCSV(inq.email),
    escapeCSV(inq.status),
    escapeCSV(inq.message),
    escapeCSV(inq.admin_notes),
    escapeCSV(inq.created_at),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  // Prepend UTF-8 BOM (\uFEFF) so Excel renders Bengali and special characters cleanly
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==============================================================================
// INQUIRY READ / UNREAD STATE MANAGEMENT
// ==============================================================================

export function getReadInquiryIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_INQUIRIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isInquiryRead(id: string, readIds: string[]): boolean {
  if (!id) return false;
  return readIds.includes(id);
}

export function markInquiryAsRead(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const existing = getReadInquiryIds();
    if (!existing.includes(id)) {
      const updated = [...existing, id];
      localStorage.setItem(READ_INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
      notifyInquiriesUpdated();
    }
  } catch {
    // ignore
  }
}

export function markInquiryAsUnread(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const existing = getReadInquiryIds();
    const updated = existing.filter((item) => item !== id);
    localStorage.setItem(READ_INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
    notifyInquiriesUpdated();
  } catch {
    // ignore
  }
}

export function markAllInquiriesAsRead(ids: string[]): void {
  if (typeof window === "undefined" || !ids || ids.length === 0) return;
  try {
    const existing = getReadInquiryIds();
    const combined = Array.from(new Set([...existing, ...ids]));
    localStorage.setItem(READ_INQUIRIES_STORAGE_KEY, JSON.stringify(combined));
    notifyInquiriesUpdated();
  } catch {
    // ignore
  }
}

export function notifyInquiriesUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kgh_inquiries_updated"));
  }
}
