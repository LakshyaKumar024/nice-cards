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

    // Extract fonts declared inside overlay HTML (data-font attributes) and
    // also include the overlay-level fontFamily as fallback.
    const fontSet = new Set<string>();
    const dataFontRegex = /data-font="([^"]+)"/g;

    for (const o of textOverlays) {
      if (o.fontFamily) fontSet.add(o.fontFamily);
      const text = o.text || "";
      let match;
      while ((match = dataFontRegex.exec(text))) {
        fontSet.add(match[1]);
      }
    }

    const uniqueFonts = [...fontSet];

    // Embed fonts
    for (const fontFamily of uniqueFonts) {
      if (isCustomFont(fontFamily)) {
        const fontBytes = await loadCustomFont(fontFamily);

        if (fontBytes) {
          try {
            const customFont = await pdfDoc.embedFont(fontBytes);
            fontCache.set(fontFamily, customFont);

            // WORKAROUND: pdf-lib strips spaces from font names internally
            // Store font with both original name and space-stripped version
            const fontFamilyNoSpaces = fontFamily.replace(/\s+/g, '');
            if (fontFamilyNoSpaces !== fontFamily) {
              fontCache.set(fontFamilyNoSpaces, customFont);
            }

            // For custom fonts, use the same font for all styles
            fontCache.set(fontFamily + '-bold', customFont);
            fontCache.set(fontFamily + '-italic', customFont);
            fontCache.set(fontFamily + '-bolditalic', customFont);

            // Also cache space-stripped versions for styles
            if (fontFamilyNoSpaces !== fontFamily) {
              fontCache.set(fontFamilyNoSpaces + '-bold', customFont);
              fontCache.set(fontFamilyNoSpaces + '-italic', customFont);
              fontCache.set(fontFamilyNoSpaces + '-bolditalic', customFont);
            }
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

    // Add overlays to each page
    for (const overlay of sortedOverlays) {
      if (!overlay.visible || overlay.page > pages.length) continue;

      const page = pages[overlay.page - 1];
      const { width, height } = page.getSize();

      if (overlay.type === 'text' && (overlay.text || "").trim()) {
        await drawTextOverlay(page, overlay, width, height, fontCache);
      } else if (overlay.type === 'shape' && overlay.shapeType === 'square') {
        await drawShapeOverlay(page, overlay, width, height);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const uint8Array = new Uint8Array(pdfBytes);
    return new Blob([uint8Array], { type: 'application/pdf' });

  } catch (error) {
    console.error('Error exporting PDF with overlays:', error);
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
    const rawText = overlay.text || "";
    const normalizedText = rawText && typeof rawText.normalize === 'function' ? rawText.normalize('NFC') : rawText;

    // CANVAS SCALE ADJUSTMENT for font size only
    const CANVAS_SCALE = 1.5;
    const adjustedFontSize = overlay.fontSize / CANVAS_SCALE;

    // Convert coordinates from canvas (top-left) to PDF (bottom-left)
    const x = overlay.x * pageWidth;
    const y = pageHeight - (overlay.y * pageHeight);

    // Parse HTML segments with optional data-font attributes
    let segments: Array<{ text: string; fontFamily: string | null }> = [];
    if (/<[a-z][\s\S]*>/i.test(rawText)) {
      const parser = new (globalThis as any).DOMParser();
      const doc = parser.parseFromString(rawText, 'text/html');
      const body = doc.body;

      function walk(node: any, currentFont: string | null) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          if (child.nodeType === 3) {
            const txt = child.textContent || '';
            if (txt) segments.push({ text: txt, fontFamily: currentFont });
          } else if (child.nodeType === 1) {
            const el = child as Element;
            const df = el.getAttribute('data-font');
            const fontForChild = df || currentFont;
            walk(child, fontForChild);
            if (el.tagName === 'BR') segments.push({ text: '\n', fontFamily: fontForChild });
          }
        }
      }

      walk(body, overlay.fontFamily || null);
    } else {
      segments = [{ text: normalizedText, fontFamily: overlay.fontFamily || null }];
    }

    // Resolve fonts and measure segments
    const resolvedSegments: Array<{ text: string; font: any; width: number }> = [];
    let totalWidth = 0;
    for (const seg of segments) {
      const fontFamily = seg.fontFamily || overlay.fontFamily || '';
      let fontKey = fontFamily;
      if (overlay.bold && overlay.italic) fontKey = fontFamily + '-bolditalic';
      else if (overlay.bold) fontKey = fontFamily + '-bold';
      else if (overlay.italic) fontKey = fontFamily + '-italic';

      let font = fontCache.get(fontKey) || fontCache.get(fontFamily) || fontCache.get('Arial') || fontCache.values().next().value;
      if (!font) font = fontCache.values().next().value;

      const segText = seg.text.replace(/\n/g, '');
      const w = font.widthOfTextAtSize(segText, adjustedFontSize);
      resolvedSegments.push({ text: segText, font, width: w });
      totalWidth += w;
    }

    // Alignment
    const centerX = x;
    const centerY = y;

    // --------------------------------------------
    // 1️⃣ ALIGNMENT (same visually as canvas)
    // --------------------------------------------
    let startX = centerX - totalWidth / 2;

    if (overlay.textAlign === 'center') {
      startX = centerX - totalWidth / 2;
    } else if (overlay.textAlign === 'right') {
      startX = centerX + totalWidth / 2 - totalWidth;
    } else {
      // left align
      startX = centerX - totalWidth / 2;
    }

    
    const firstSegFont = resolvedSegments[0]?.font;

    // fallback if missing
    const ascent = firstSegFont?.ascent || firstSegFont?.font?.ascent || 0;
    const units = firstSegFont?.unitsPerEm || 1000;

    // this fixes DOWNWARD SHIFT
    const baselineAdjust = (ascent / units) * adjustedFontSize;

    // CANVAS centerY = PDF baseline → adjust by half font size + baseline
    const finalY = centerY - adjustedFontSize / 2 + baselineAdjust + 4;


    // Draw with rotation if needed
    if (overlay.rotation && overlay.rotation !== 0) {
      const radians = -(overlay.rotation * Math.PI) / 180;
      const centerX = startX + totalWidth / 2;
      const centerY = finalY + adjustedFontSize / 2;

      page.pushOperators(pushGraphicsState());
      page.pushOperators(translate(centerX, centerY));
      page.pushOperators(rotateRadians(radians));
      page.pushOperators(translate(-centerX, -centerY));

      let cursorX = startX;
      for (const seg of resolvedSegments) {
        page.drawText(seg.text, { x: cursorX, y: finalY, size: adjustedFontSize, font: seg.font, color: hexToRgb(overlay.color) });
        cursorX += seg.width;
      }

      page.pushOperators(popGraphicsState());
    } else {
      let cursorX = startX;
      for (const seg of resolvedSegments) {
        page.drawText(seg.text, { x: cursorX, y: finalY, size: adjustedFontSize, font: seg.font, color: hexToRgb(overlay.color) });
        cursorX += seg.width;
      }
    }

  } catch (error) {
    console.error('❌ Error drawing text overlay:', error);
    // Fallback: draw plain text
    try {
      const adjustedFontSize = (overlay.fontSize || 12) / 1.5;
      const x = overlay.x * pageWidth;
      const y = pageHeight - (overlay.y * pageHeight) - adjustedFontSize;
      const font = fontCache.get(overlay.fontFamily) || fontCache.values().next().value;
      page.drawText(String(overlay.text || ''), { x, y, size: adjustedFontSize, font, color: hexToRgb(overlay.color) });
    } catch (fallbackError) {
      console.error('💥 Fallback drawing failed:', fallbackError);
    }
  }
}

async function drawShapeOverlay(
  page: any,
  overlay: ShapeOverlay,
  pageWidth: number,
  pageHeight: number
) {
  try {
    const shapeWidth = overlay.width * pageWidth;
    const shapeHeight = overlay.height * pageHeight;

    // Canvas places element with translate(-50%, -50%) so x,y are centers
    const centerX = overlay.x * pageWidth;
    const centerY = pageHeight - (overlay.y * pageHeight);

    if (overlay.rotation && overlay.rotation !== 0) {
      const radians = -(overlay.rotation * Math.PI) / 180;
      page.pushOperators(pushGraphicsState());
      page.pushOperators(translate(centerX, centerY));
      page.pushOperators(rotateRadians(radians));
      page.pushOperators(translate(-centerX, -centerY));

      page.drawRectangle({
        x: centerX - shapeWidth / 2,
        y: centerY - shapeHeight / 2,
        width: shapeWidth,
        height: shapeHeight,
        color: hexToRgb(overlay.color),
      });

      page.pushOperators(popGraphicsState());
    } else {
      page.drawRectangle({
        x: centerX - shapeWidth / 2,
        y: centerY - shapeHeight / 2,
        width: shapeWidth,
        height: shapeHeight,
        color: hexToRgb(overlay.color),
      });
    }
  } catch (err) {
    console.error('Error drawing shape overlay:', err);
    try {
      const shapeWidth = overlay.width * pageWidth;
      const shapeHeight = overlay.height * pageHeight;
      const centerX = overlay.x * pageWidth;
      const centerY = pageHeight - (overlay.y * pageHeight);
      page.drawRectangle({ x: centerX - shapeWidth / 2, y: centerY - shapeHeight / 2, width: shapeWidth, height: shapeHeight, color: hexToRgb(overlay.color) });
    } catch (fallbackError) {
      console.error('💥 Fallback shape drawing failed:', fallbackError);
    }
  }
}
