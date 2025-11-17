/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/export-utils.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Overlay, TextOverlay, ShapeOverlay } from '@/components/pdf-editor';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

// Map custom fonts to standard PDF fonts
function getStandardFont(fontFamily: string): StandardFonts {
  const fontMap: { [key: string]: StandardFonts } = {
    'Arial': StandardFonts.Helvetica,
    'Helvetica': StandardFonts.Helvetica,
    'Times New Roman': StandardFonts.TimesRoman,
    'Courier New': StandardFonts.Courier,
    'Verdana': StandardFonts.Helvetica,
    'Georgia': StandardFonts.TimesRoman,
    'Palatino': StandardFonts.TimesRoman,
    'AMS Aasmi': StandardFonts.Helvetica,
    'Kruti Dev 640': StandardFonts.Helvetica,
  };

  return fontMap[fontFamily] || StandardFonts.Helvetica;
}

export async function exportPDFWithOverlays(
  pdfFile: File, 
  overlays: Overlay[]
): Promise<Blob> {
  try {
    // Load the original PDF
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pages = pdfDoc.getPages();
    
    // Sort overlays by zIndex (lower zIndex = drawn first, higher zIndex = drawn on top)
    const sortedOverlays = [...overlays].sort((a, b) => a.zIndex - b.zIndex);
    
    // Pre-embed fonts
    const fontCache = new Map();
    const uniqueFonts = [...new Set(overlays.filter(o => o.type === 'text').map(o => (o as TextOverlay).fontFamily))];
    
    for (const fontFamily of uniqueFonts) {
      const standardFont = getStandardFont(fontFamily);
      fontCache.set(fontFamily, await pdfDoc.embedFont(standardFont));
      
      // Also embed bold and italic variants
      if (standardFont === StandardFonts.Helvetica) {
        fontCache.set(fontFamily + '-bold', await pdfDoc.embedFont(StandardFonts.HelveticaBold));
        fontCache.set(fontFamily + '-italic', await pdfDoc.embedFont(StandardFonts.HelveticaOblique));
        fontCache.set(fontFamily + '-bolditalic', await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique));
      } else if (standardFont === StandardFonts.TimesRoman) {
        fontCache.set(fontFamily + '-bold', await pdfDoc.embedFont(StandardFonts.TimesRomanBold));
        fontCache.set(fontFamily + '-italic', await pdfDoc.embedFont(StandardFonts.TimesRomanItalic));
        fontCache.set(fontFamily + '-bolditalic', await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic));
      }
    }
    
    // Add overlays to each page in zIndex order
    for (const overlay of sortedOverlays) {
      if (!overlay.visible || overlay.page > pages.length) continue;
      
      const page = pages[overlay.page - 1];
      const { width, height } = page.getSize();
      
      if (overlay.type === 'text' && overlay.text.trim()) {
        drawTextOverlay(page, overlay, width, height, fontCache);
      } else if (overlay.type === 'shape' && overlay.shapeType === 'square') {
        drawShapeOverlay(page, overlay, width, height);
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    
    // Convert to Blob
    const uint8Array = new Uint8Array(pdfBytes);
    return new Blob([uint8Array], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error exporting PDF with overlays:', error);
    throw new Error('Failed to export PDF');
  }
}

function drawTextOverlay(
  page: any,
  overlay: TextOverlay,
  pageWidth: number,
  pageHeight: number,
  fontCache: Map<string, any>
) {
  try {
    // Get the appropriate font based on style
    let fontKey = overlay.fontFamily;
    if (overlay.bold && overlay.italic) {
      fontKey = overlay.fontFamily + '-bolditalic';
    } else if (overlay.bold) {
      fontKey = overlay.fontFamily + '-bold';
    } else if (overlay.italic) {
      fontKey = overlay.fontFamily + '-italic';
    }
    
    const font = fontCache.get(fontKey) || fontCache.get(overlay.fontFamily);
    
    if (!font) {
      console.warn(`Font not found for: ${overlay.fontFamily}`);
      return;
    }

    // Convert coordinates - match canvas positioning
    const x = overlay.x * pageWidth;
    const y = pageHeight - (overlay.y * pageHeight); // PDF y-axis is bottom-up
    
    // Calculate text dimensions for centering (matching canvas behavior)
    const textWidth = font.widthOfTextAtSize(overlay.text, overlay.fontSize);
    const textHeight = overlay.fontSize * 0.8; // Approximate height factor
    
    // Center the text (matching canvas transform: translate(-50%, -50%))
    const centeredX = x - (textWidth / 2);
    const centeredY = y - (textHeight / 2);
    
    console.log(`Exporting text: "${overlay.text}"`);
    console.log(`  Original: (${overlay.x}, ${overlay.y})`);
    console.log(`  Page coords: (${x}, ${y})`);
    console.log(`  Centered: (${centeredX}, ${centeredY})`);
    console.log(`  Font size: ${overlay.fontSize}px`);
    console.log(`  Text width: ${textWidth}px`);
    
    page.drawText(overlay.text, {
      x: centeredX,
      y: centeredY,
      size: overlay.fontSize, // Use exact font size
      font: font,
      color: hexToRgb(overlay.color),
    });
  } catch (error) {
    console.error('Error drawing text overlay in export:', error);
  }
}

function drawShapeOverlay(
  page: any,
  overlay: ShapeOverlay,
  pageWidth: number,
  pageHeight: number
) {
  const shapeWidth = overlay.width * pageWidth;
  const shapeHeight = overlay.height * pageHeight;
  
  // Convert coordinates and center the shape (matching canvas behavior)
  const x = overlay.x * pageWidth - (shapeWidth / 2);
  const y = pageHeight - (overlay.y * pageHeight) - (shapeHeight / 2);
  
  page.drawRectangle({
    x: x,
    y: y,
    width: shapeWidth,
    height: shapeHeight,
    color: hexToRgb(overlay.color),
  });
}