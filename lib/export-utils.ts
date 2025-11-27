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
    // Normalize Unicode text
    const normalizedText = overlay.text.normalize('NFC');

    console.log(`📝 Drawing text: "${overlay.text}"`);
    console.log(`   Font: ${overlay.fontFamily}, Bold: ${overlay.bold}, Italic: ${overlay.italic}`);
    console.log(`   Rotation: ${overlay.rotation}°`);

    // Get the appropriate font
    let fontKey = overlay.fontFamily;
    if (overlay.bold && overlay.italic) {
      fontKey = overlay.fontFamily + '-bolditalic';
    } else if (overlay.bold) {
      fontKey = overlay.fontFamily + '-bold';
    } else if (overlay.italic) {
      fontKey = overlay.fontFamily + '-italic';
    }

    let font = fontCache.get(fontKey) || fontCache.get(overlay.fontFamily);

    // Final fallback
    if (!font) {
      console.warn(`Font not found for: ${fontKey}, using Helvetica fallback`);
      font = fontCache.get('Arial') || fontCache.get('Helvetica') || fontCache.values().next().value;
    }

    console.log(`   Using font:`, font?.constructor?.name);

    // CANVAS SCALE ADJUSTMENT
    const CANVAS_SCALE = 1.5;
    const adjustedFontSize = overlay.fontSize / CANVAS_SCALE;

    // FIXED: Correct coordinate conversion
    // Canvas uses top-left origin, PDF uses bottom-left origin
    // We need to account for the text height in PDF coordinates
    const textWidth = font.widthOfTextAtSize(normalizedText, adjustedFontSize);
    const textHeight = adjustedFontSize;

    // Convert coordinates from canvas (top-left) to PDF (bottom-left)
    const x = overlay.x * pageWidth;
    const y = pageHeight - (overlay.y * pageHeight);

    // FIXED: Account for the text positioning difference
    // In canvas, text is positioned at the top-left of the text box
    // In PDF, text is positioned at the baseline (bottom-left)
    const finalX = x;
    const finalY = y - textHeight; // Adjust for baseline positioning

    console.log(`   Original Size: ${overlay.fontSize}px, Adjusted: ${adjustedFontSize.toFixed(1)}px`);
    console.log(`   Position: (${finalX.toFixed(2)}, ${finalY.toFixed(2)})`);

    // Handle rotation using manual transformation matrix
    if (overlay.rotation !== 0) {
      console.log(`   Applying rotation: ${overlay.rotation}°`);

      const radians = -(overlay.rotation * Math.PI) / 180;

      // Rotation center should account for the text height adjustment
      const centerX = finalX + (textWidth / 2);
      const centerY = finalY + (textHeight / 2);

      // Save state
      page.pushOperators(pushGraphicsState());

      // Move origin to rotation center
      page.pushOperators(translate(centerX, centerY));

      // Rotate
      page.pushOperators(rotateRadians(radians));

      // Move back
      page.pushOperators(translate(-centerX, -centerY));

      const drawOptions: any = {
        x: finalX,
        y: finalY,
        size: adjustedFontSize,
        font,
        color: hexToRgb(overlay.color),
      };

      if (overlay.bold && isCustomFont(overlay.fontFamily)) {
        page.drawText(normalizedText, drawOptions);
        page.drawText(normalizedText, { ...drawOptions, x: finalX + 0.7 });
      } else {
        page.drawText(normalizedText, drawOptions);
      }

      // Restore graphics state
      page.pushOperators(popGraphicsState());

    } else {
      // No rotation - simple text drawing
      const options: any = {
        x: finalX,
        y: finalY,
        size: adjustedFontSize,
        font: font,
        color: hexToRgb(overlay.color),
      };

      if (overlay.bold && isCustomFont(overlay.fontFamily)) {
        page.drawText(normalizedText, options);
        page.drawText(normalizedText, {
          ...options,
          x: finalX + 0.7,
        });
      } else {
        page.drawText(normalizedText, options);
      }
    }

    console.log(`   ✅ Text drawn successfully`);

  } catch (error) {
    console.error('❌ Error drawing text overlay:', error);

    // Ultimate fallback - draw without formatting
    try {
      const normalizedText = overlay.text.normalize('NFC');
      const CANVAS_SCALE = 1.5;
      const adjustedFontSize = overlay.fontSize / CANVAS_SCALE;

      // Fallback coordinate conversion
      const x = overlay.x * pageWidth;
      const y = pageHeight - (overlay.y * pageHeight) - adjustedFontSize;

      page.drawText(normalizedText, {
        x: x,
        y: y,
        size: adjustedFontSize,
        color: hexToRgb(overlay.color),
      });
      console.log(`   ✅ Fallback text drawn`);
    } catch (fallbackError) {
      console.error('💥 Fallback drawing failed:', fallbackError);
    }
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
