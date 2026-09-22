/**
 * Client-side PDF export utility for KGH Dental appointment slips.
 * Clones the target element to a fixed 800px offscreen container so that
 * the generated PDF looks pristine and identical on both mobile and desktop.
 */

export async function downloadSlipPdf(
  element: HTMLElement | null,
  fileName: string = "KGH-Appointment-Slip.pdf"
): Promise<boolean> {
  if (!element || typeof window === "undefined") {
    console.error("downloadSlipPdf: Target element not found or not in browser environment.");
    return false;
  }

  // Create an off-screen clone with guaranteed 800px A4-proportional width
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = "kgh-pdf-export-clone";
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = "800px";
  clone.style.maxWidth = "800px";
  clone.style.zIndex = "-9999";
  clone.style.background = "#ffffff";
  clone.classList.remove("hidden");
  document.body.appendChild(clone);

  try {
    const html2canvasModule = await import("html2canvas");
    const jspdfModule = await import("jspdf");
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const jsPDF = jspdfModule.jsPDF || (jspdfModule.default as unknown as typeof jspdfModule.jsPDF);

    // Wait a brief frame for clone DOM layout and font calculation
    await new Promise((resolve) => setTimeout(resolve, 100));

    // High resolution render of the element
    const canvas = await html2canvas(clone, {
      scale: 2, // 2x for sharp retina text and Bengali ligatures
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 800,
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL("image/png");

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const maxPrintWidth = pageWidth - margin * 2; // 190mm
    const maxPrintHeight = pageHeight - margin * 2; // 277mm

    let renderWidth = maxPrintWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    // Scale to fit on a single A4 page cleanly
    if (renderHeight > maxPrintHeight) {
      const scaleDown = maxPrintHeight / renderHeight;
      renderHeight = maxPrintHeight;
      renderWidth = renderWidth * scaleDown;
    }

    const xOffset = (pageWidth - renderWidth) / 2;
    const yOffset = margin;

    pdf.addImage(imgData, "PNG", xOffset, yOffset, renderWidth, renderHeight, undefined, "FAST");

    // Clean filename ensuring .pdf extension
    const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);

    return true;
  } catch (error) {
    console.error("Failed to generate PDF slip:", error);
    // Fallback to window.print() if canvas fails
    if (typeof window !== "undefined") {
      window.print();
    }
    return false;
  } finally {
    // Always clean up clone from DOM
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
}
