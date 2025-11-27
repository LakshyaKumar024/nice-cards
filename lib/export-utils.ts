/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/export-utils.ts
import {
  PDFDocument,
  rgb,
  StandardFonts,
  pushGraphicsState,
  popGraphicsState,
  rotateRadians,
  translate,
} from 'pdf-lib';
import * as fontkit from 'fontkit';
import type { Overlay, TextOverlay, ShapeOverlay } from '@/components/pdf-editor';
import { loadCustomFont, isCustomFont } from './custom-fonts';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

function getStandardFont(fontFamily: string): StandardFonts {
  const fontMap: { [key: string]: StandardFonts } = {
    'Arial': StandardFonts.Helvetica,
    'Helvetica': StandardFonts.Helvetica,
    'Times New Roman': StandardFonts.TimesRoman,
    'Courier New': StandardFonts.Courier,
    'Verdana': StandardFonts.Helvetica,
    'Georgia': StandardFonts.TimesRoman,
    'Palatino': StandardFonts.TimesRoman,
  };
  return fontMap[fontFamily] || StandardFonts.Helvetica;
}

export async function exportPDFWithOverlays(
  pdfFile: File,
  overlays: Overlay[]
): Promise<Blob> {
  console.log('=== STARTING PDF EXPORT ===');

  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // ✅ REGISTER FONTKIT
    pdfDoc.registerFontkit(fontkit);
    console.log('✅ FontKit registered successfully');

    const pages = pdfDoc.getPages();
    const sortedOverlays = [...overlays].sort((a, b) => a.zIndex - b.zIndex);
    const fontCache = new Map();

    // Get unique fonts from overlays
    const textOverlays = overlays.filter(o => o.type === 'text') as TextOverlay[];
    const uniqueFonts = [...new Set(textOverlays.map(o => o.fontFamily))];

    console.log('📊 Fonts to process:', uniqueFonts);

    // Embed fonts
    for (const fontFamily of uniqueFonts) {
      console.log(`🎨 Processing font: "${fontFamily}"`);

      if (isCustomFont(fontFamily)) {
        console.log(`   🔧 Identified as custom font`);
        const fontBytes = await loadCustomFont(fontFamily);

        if (fontBytes) {
          try {
            console.log(`   📥 Embedding custom font into PDF...`);
            const customFont = await pdfDoc.embedFont(fontBytes);
            fontCache.set(fontFamily, customFont);
            console.log(`   ✅ Successfully embedded custom font: ${fontFamily}`);

            // For custom fonts, use the same font for all styles
            fontCache.set(fontFamily + '-bold', customFont);
            fontCache.set(fontFamily + '-italic', customFont);
            fontCache.set(fontFamily + '-bolditalic', customFont);
          } catch (embedError) {
            console.error(`   ❌ Failed to embed custom font ${fontFamily}:`, embedError);
            console.log(`   🔄 Using fallback font`);
            // Use standard fonts as fallback
            const standardFont = getStandardFont(fontFamily);
            const embeddedFont = pdfDoc.embedStandardFont(standardFont);
            fontCache.set(fontFamily, embeddedFont);
            fontCache.set(fontFamily + '-bold', pdfDoc.embedStandardFont(StandardFonts.HelveticaBold));
            fontCache.set(fontFamily + '-italic', pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique));
            fontCache.set(fontFamily + '-bolditalic', pdfDoc.embedStandardFont(StandardFonts.HelveticaBoldOblique));
          }
        } else {
          console.log(`   ❌ No font bytes, using fallback`);
          const standardFont = getStandardFont(fontFamily);
          const embeddedFont = pdfDoc.embedStandardFont(standardFont);
          fontCache.set(fontFamily, embeddedFont);
          fontCache.set(fontFamily + '-bold', pdfDoc.embedStandardFont(StandardFonts.HelveticaBold));
          fontCache.set(fontFamily + '-italic', pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique));
          fontCache.set(fontFamily + '-bolditalic', pdfDoc.embedStandardFont(StandardFonts.HelveticaBoldOblique));
        }
      } else {
        console.log(`   🔧 Identified as standard font`);
        const standardFont = getStandardFont(fontFamily);
        const embeddedFont = pdfDoc.embedStandardFont(standardFont);
        fontCache.set(fontFamily, embeddedFont);

        // Embed style variants for standard fonts
        if (standardFont === StandardFonts.Helvetica) {
          fontCache.set(fontFamily + '-bold', pdfDoc.embedStandardFont(StandardFonts.HelveticaBold));
          fontCache.set(fontFamily + '-italic', pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique));
          fontCache.set(fontFamily + '-bolditalic', pdfDoc.embedStandardFont(StandardFonts.HelveticaBoldOblique));
        } else if (standardFont === StandardFonts.TimesRoman) {
          fontCache.set(fontFamily + '-bold', pdfDoc.embedStandardFont(StandardFonts.TimesRomanBold));
          fontCache.set(fontFamily + '-italic', pdfDoc.embedStandardFont(StandardFonts.TimesRomanItalic));
          fontCache.set(fontFamily + '-bolditalic', pdfDoc.embedStandardFont(StandardFonts.TimesRomanBoldItalic));
        } else {
          // Fallback to Helvetica variants
          fontCache.set(fontFamily + '-bold', pdfDoc.embedStandardFont(StandardFonts.HelveticaBold));
          fontCache.set(fontFamily + '-italic', pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique));
          fontCache.set(fontFamily + '-bolditalic', pdfDoc.embedStandardFont(StandardFonts.HelveticaBoldOblique));
        }
      }
    }

    // Debug: Test all fonts
    console.log('=== FONT CACHE DEBUG ===');
    for (const [key, font] of fontCache.entries()) {
      console.log(`Font "${key}":`, {
        type: font?.constructor?.name,
        name: font?.name,
        isStandardFont: font instanceof PDFDocument.prototype.embedStandardFont
      });
    }

    // Add overlays to each page
    for (const overlay of sortedOverlays) {
      if (!overlay.visible || overlay.page > pages.length) continue;

      const page = pages[overlay.page - 1];
      const { width, height } = page.getSize();

      if (overlay.type === 'text' && overlay.text.trim()) {
        await drawTextOverlay(page, overlay, width, height, fontCache);
      } else if (overlay.type === 'shape' && overlay.shapeType === 'square') {
        await drawShapeOverlay(page, overlay, width, height);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const uint8Array = new Uint8Array(pdfBytes);
    return new Blob([uint8Array], { type: 'application/pdf' });

  } catch (error) {
    console.error('💥 Error exporting PDF with overlays:', error);
    throw new Error('Failed to export PDF');
  }
}


async function drawTextOverlay(
  page: any,
  overlay: TextOverlay,
  pageWidth: number,
  pageHeight: number,
  fontCache: Map<string, any>
) {
  try {
    const normalizedText = overlay.text.normalize("NFC");

    // ============= FONT ======================
    let fontKey = overlay.fontFamily;
    if (overlay.bold && overlay.italic) fontKey += "-bolditalic";
    else if (overlay.bold) fontKey += "-bold";
    else if (overlay.italic) fontKey += "-italic";

    let font = fontCache.get(fontKey) || fontCache.get(overlay.fontFamily);
    if (!font) font = fontCache.values().next().value; // last fallback

    // ============= SIZES ======================
    const CANVAS_SCALE = 1.5;
    const fontSize = overlay.fontSize / CANVAS_SCALE;

    // ============= CANVAS → PDF COORD FIX ======================
    // canvas: anchor is CENTER of the text box
    const centerX = overlay.x * pageWidth;
    const centerY = pageHeight - overlay.y * pageHeight;

    // ========= MEASURE MULTILINE BOX =========
    const lines = normalizedText.split("\n");
    const lineHeight = fontSize * 1.2;

    const lineWidths = lines.map((line) =>
      font.widthOfTextAtSize(line, fontSize)
    );

    const boxWidth = Math.max(...lineWidths);
    const boxHeight = lines.length * lineHeight;

    // canvas uses: translate(-50%, -50%)
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;

    // ========== ALIGNMENT INSIDE THE BOX ==========
    function getAlignedX(lineWidth: number) {
      if (overlay.textAlign === "center")
        return boxX + (boxWidth - lineWidth) / 2;
      if (overlay.textAlign === "right")
        return boxX + (boxWidth - lineWidth);
      return boxX; // left
    }

    // ========= APPLY ROTATION ==========
    if (overlay.rotation !== 0) {
      const rad = -(overlay.rotation * Math.PI) / 180;
      page.pushOperators(pushGraphicsState());
      page.pushOperators(translate(centerX, centerY));
      page.pushOperators(rotateRadians(rad));
      page.pushOperators(translate(-centerX, -centerY));
    }

    // ========== DRAW TEXT LINES ==========
    lines.forEach((line, i) => {
      const width = lineWidths[i];

      const x = getAlignedX(width);
      const y = boxY + (boxHeight - lineHeight * (i + 1));

      page.drawText(line, {
        x,
        y,
        size: fontSize,
        font,
        color: hexToRgb(overlay.color),
      });
    });

    if (overlay.rotation !== 0) {
      page.pushOperators(popGraphicsState());
    }

    console.log("✓ Text drawn correctly");

  } catch (err) {
    console.error("❌ drawTextOverlay error:", err);
  }
}










function drawShapeOverlay(page: any, overlay: ShapeOverlay, pageWidth: number, pageHeight: number) {
  try {
    const shapeWidth = overlay.width * pageWidth;
    const shapeHeight = overlay.height * pageHeight;

    // FIX: Match the canvas positioning with translate(-50%, -50%)
    // In canvas, shapes are centered at (x,y) with translate(-50%, -50%)
    // So in PDF, we need to draw them centered at the same position
    const x = overlay.x * pageWidth;
    const y = pageHeight - (overlay.y * pageHeight);

    console.log(`🎨 Drawing shape:`, {
      originalOverlay: { x: overlay.x, y: overlay.y },
      calculatedCoords: { x, y },
      shapeSize: { width: shapeWidth, height: shapeHeight }
    });

    if (overlay.rotation !== 0) {
      const radians = -(overlay.rotation * Math.PI / 180);

      // rotation center = shape center (matches canvas with translate(-50%, -50%))
      const centerX = x;
      const centerY = y;

      page.pushOperators(pushGraphicsState());
      page.pushOperators(translate(centerX, centerY));
      page.pushOperators(rotateRadians(radians));
      page.pushOperators(translate(-centerX, -centerY));

      // Draw centered (matches canvas with translate(-50%, -50%))
      page.drawRectangle({
        x: centerX - shapeWidth / 2,
        y: centerY - shapeHeight / 2,
        width: shapeWidth,
        height: shapeHeight,
        color: hexToRgb(overlay.color),
      });

      page.pushOperators(popGraphicsState());
    } else {
      // No rotation - centered positioning (matches canvas with translate(-50%, -50%))
      page.drawRectangle({
        x: x - (shapeWidth / 2),
        y: y - (shapeHeight / 2),
        width: shapeWidth,
        height: shapeHeight,
        color: hexToRgb(overlay.color),
      });
    }

  } catch (err) {
    console.error("Shape export error:", err);
  }
}
