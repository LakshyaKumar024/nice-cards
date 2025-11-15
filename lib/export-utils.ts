// lib/export-utils.ts
import { PDFDocument, rgb } from 'pdf-lib';
import type { TextOverlay } from '@/components/pdf-editor';

export async function exportPDFWithOverlays(
  pdfFile: File, 
  overlays: TextOverlay[]
): Promise<Blob> {
  try {
    // Load the original PDF
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pages = pdfDoc.getPages();
    
    // Add overlays to each page
    overlays.forEach((overlay) => {
      if (overlay.visible && overlay.page <= pages.length) {
        const page = pages[overlay.page - 1];
        const { width, height } = page.getSize();
        
        page.drawText(overlay.text, {
          x: overlay.x * width,
          y: height - (overlay.y * height),
          size: overlay.fontSize,
          color: rgb(
            parseInt(overlay.color.slice(1, 3), 16) / 255,
            parseInt(overlay.color.slice(3, 5), 16) / 255,
            parseInt(overlay.color.slice(5, 7), 16) / 255
          ),
        });
      }
    });
    
    const pdfBytes = await pdfDoc.save();
    
    // Convert to Blob
    const uint8Array = new Uint8Array(pdfBytes);
    return new Blob([uint8Array], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error exporting PDF with overlays:', error);
    throw new Error('Failed to export PDF');
  }
}