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
    const normalized = rawText.normalize("NFC");

const EXPLICIT_POSITION_ADDITION = 4; 

    // ========== PARSE HTML INTO SEGMENTS (multi-font) ==========
    const segments: Array<{ text: string; font: any }> = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawText, "text/html");

    function walk(node: any, currentFontFamily: string | null) {
      for (const child of node.childNodes) {
        if (child.nodeType === 3) {
          segments.push({
            text: child.textContent || "",
            font: resolveFont(currentFontFamily),
          });
        } else if (child.nodeType === 1) {
          const el = child as HTMLElement;
          const chosenFont = el.getAttribute("data-font") || currentFontFamily;
          if (el.tagName === "BR") {
            segments.push({ text: "\n", font: resolveFont(chosenFont) });
          }
          walk(el, chosenFont);
        }
      }
    }

    walk(doc.body, overlay.fontFamily);

    // ========== HELPER: SELECT FONT FROM CACHE ==========
    function resolveFont(fontFamily: string | null) {
      if (!fontFamily) return [...fontCache.values()][0];
      let key = fontFamily;

      if (overlay.bold && overlay.italic) key += "-bolditalic";
      else if (overlay.bold) key += "-bold";
      else if (overlay.italic) key += "-italic";

      return (
        fontCache.get(key) ||
        fontCache.get(fontFamily) ||
        fontCache.get(fontFamily.replace(/\s+/g, "")) ||
        [...fontCache.values()][0]
      );
    }

    // ========== MULTILINE SPLIT ==========
    const lines: Array<Array<{ text: string; font: any; width: number }>> = [];
    let currentLine: Array<{ text: string; font: any; width: number }> = [];

    const CANVAS_SCALE = 1.5;
    const fontSize = overlay.fontSize / CANVAS_SCALE;

    for (const seg of segments) {
      if (seg.text.includes("\n")) {
        const parts = seg.text.split("\n");
        parts.forEach((p, idx) => {
          const width = seg.font.widthOfTextAtSize(p, fontSize);
          currentLine.push({
            text: p,
            font: seg.font,
            width: width,
          });
          if (idx < parts.length - 1) {
            lines.push(currentLine);
            currentLine = [];
          }
        });
      } else {
        const width = seg.font.widthOfTextAtSize(seg.text, fontSize);
        currentLine.push({
          text: seg.text,
          font: seg.font,
          width: width,
        });
      }
    }

    if (currentLine.length > 0) lines.push(currentLine);

    // ========== POSITIONING ==========
    // canvas: anchor is CENTER of the text box with translate(-50%, -50%)
    const centerX = overlay.x * pageWidth;
    const centerY = pageHeight - overlay.y * pageHeight; // Convert to PDF coords (Y down)

    const lineHeight = fontSize * 1.25;
    
    // Calculate line widths for alignment
    const lineWidths = lines.map(line => 
      line.reduce((total, seg) => total + seg.width, 0)
    );
    const maxLineWidth = Math.max(...lineWidths);
    const totalHeight = lines.length * lineHeight;

    // canvas uses: translate(-50%, -50%) for centering
    // So the text box is centered at (centerX, centerY)
    // In PDF: boxY is the BOTTOM of the text box (Y increases upward)
    const boxX = centerX - maxLineWidth / 2;  // Left edge of bounding box
    const boxY = centerY - totalHeight / 2 + EXPLICIT_POSITION_ADDITION;   // Bottom edge of bounding box

    // ========== ALIGNMENT INSIDE THE BOX ==========
    function getAlignedX(lineWidth: number) {
      if (overlay.textAlign === "center") {
        return boxX + (maxLineWidth - lineWidth) / 2;
      } else if (overlay.textAlign === "right") {
        return boxX + (maxLineWidth - lineWidth);
      } else {
        return boxX; // left align
      }
    }

    // ========== DRAW FUNCTION ==========
    const drawEverything = () => {
      lines.forEach((line, idx) => {
        // Filter out empty segments but keep spaces
        const cleaned = line.filter(s => s.text !== ""); // Keep spaces
        const lineWidth = cleaned.reduce((total, seg) => total + seg.width, 0);
        
        // Get X position based on alignment
        const x = getAlignedX(lineWidth);
        
        // Y position: 
        // In PDF, Y increases upward, so we need to calculate from bottom up
        // First line (index 0) should be at the TOP in canvas view, but
        // in PDF, that's actually the highest Y value
        // So: boxY is the bottom, we add lineHeight for each line
        const y = boxY + (lines.length - idx - 1) * lineHeight;

        let cursorX = x;

        for (const seg of cleaned) {
          // Only draw if there's actual text (not just whitespace)
          if (seg.text.trim() !== "" || seg.text === " ") {
            page.drawText(seg.text, {
              x: cursorX,
              y,
              font: seg.font,
              size: fontSize,
              color: hexToRgb(overlay.color),
            });
          }
          cursorX += seg.width;
        }
      });
    };

    // ========== ROTATION SUPPORT ==========
    if (overlay.rotation) {
      const radians = -(overlay.rotation * Math.PI) / 180;
      page.pushOperators(pushGraphicsState());
      page.pushOperators(translate(centerX, centerY));
      page.pushOperators(rotateRadians(radians));
      page.pushOperators(translate(-centerX, -centerY));
      drawEverything();
      page.pushOperators(popGraphicsState());
    } else {
      drawEverything();
    }
  } catch (error) {
    console.error("❌ Error drawing text overlay:", error);
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

    // FIX: Match the canvas positioning with translate(-50%, -50%)
    // In canvas, shapes are centered at (x,y) with translate(-50%, -50%)
    // So in PDF, we need to draw them centered at the same position
    const x = overlay.x * pageWidth;
    const y = pageHeight - (overlay.y * pageHeight);

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
    console.error("Error drawing shape overlay:", err);
  }
}