/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/export-utils.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fontkit from 'fontkit';
import type { Overlay, TextOverlay, ShapeOverlay } from '@/components/pdf-editor';
import { customFonts, loadCustomFont, isCustomFont } from './custom-fonts';

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

    // ✅ REGISTER FONTKIT - THIS IS THE KEY FIX
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
          } catch (embedError) {
            console.error(`   ❌ Failed to embed custom font ${fontFamily}:`, embedError);
            console.log(`   🔄 Using fallback font`);
            const standardFont = getStandardFont(fontFamily);
            fontCache.set(fontFamily, await pdfDoc.embedFont(standardFont));
          }
        } else {
          console.log(`   ❌ No font bytes, using fallback`);
          const standardFont = getStandardFont(fontFamily);
          fontCache.set(fontFamily, await pdfDoc.embedFont(standardFont));
        }
      } else {
        console.log(`   🔧 Identified as standard font`);
        const standardFont = getStandardFont(fontFamily);
        fontCache.set(fontFamily, await pdfDoc.embedFont(standardFont));

        // Also embed bold and italic variants for standard fonts
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
    }

    // Add overlays to each page
    for (const overlay of sortedOverlays) {
      if (!overlay.visible || overlay.page > pages.length) continue;

      const page = pages[overlay.page - 1];
      const { width, height } = page.getSize();

      if (overlay.type === 'text' && overlay.text.trim()) {
        await drawTextOverlay(page, overlay, width, height, fontCache);
      } else if (overlay.type === 'shape' && overlay.shapeType === 'square') {
        drawShapeOverlay(page, overlay, width, height);
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
    // Normalize Unicode text to NFC form (composed characters)
    // This fixes issues with pasted text from Google Translate
    const normalizedText = overlay.text.normalize('NFC');
    
    console.log(`📝 Original text: "${overlay.text}"`);
    if (normalizedText !== overlay.text) {
      console.log(`   🔄 Normalized to: "${normalizedText}"`);
    }

    // Get the appropriate font based on style
    let fontKey = overlay.fontFamily;
    if (overlay.bold && overlay.italic) {
      fontKey = overlay.fontFamily + '-bolditalic';
    } else if (overlay.bold) {
      fontKey = overlay.fontFamily + '-bold';
    } else if (overlay.italic) {
      fontKey = overlay.fontFamily + '-italic';
    }

    let font = fontCache.get(fontKey) || fontCache.get(overlay.fontFamily);

    // Fallback if font not found
    if (!font) {
      console.warn(`Font not found for: ${overlay.fontFamily}, using Helvetica fallback`);
      font = fontCache.get('Arial') || fontCache.values().next().value;
    }

    // CANVAS SCALE ADJUSTMENT: The canvas is rendered at 1.5x scale
    // So we need to divide the font size by 1.5 to match the actual PDF size
    const CANVAS_SCALE = 1.5;
    const adjustedFontSize = overlay.fontSize / CANVAS_SCALE;

    // Convert coordinates - match canvas positioning
    const x = overlay.x * pageWidth;
    const y = pageHeight - (overlay.y * pageHeight);

    // Calculate text dimensions for centering with adjusted font size
    const textWidth = font.widthOfTextAtSize(normalizedText, adjustedFontSize);
    const textHeight = adjustedFontSize * 0.8;

    // Vertical offset adjustment to move text up slightly
    const VERTICAL_OFFSET = adjustedFontSize * 0.3;

    // Center the text
    const centeredX = x - (textWidth / 2);
    const centeredY = y - (textHeight / 2) + VERTICAL_OFFSET;

    console.log(`   Font: ${overlay.fontFamily}, Original Size: ${overlay.fontSize}px, Adjusted: ${adjustedFontSize.toFixed(1)}px`);
    console.log(`   Position: (${centeredX.toFixed(2)}, ${centeredY.toFixed(2)})`);

    page.drawText(normalizedText, {
      x: centeredX,
      y: centeredY,
      size: adjustedFontSize,
      font: font,
      color: hexToRgb(overlay.color),
    });
  } catch (error) {
    console.error('Error drawing text overlay in export:', error);

    // Fallback: draw with basic font
    try {
      const normalizedText = overlay.text.normalize('NFC');
      const CANVAS_SCALE = 1.5;
      const adjustedFontSize = overlay.fontSize / CANVAS_SCALE;
      const x = overlay.x * pageWidth;
      const y = pageHeight - (overlay.y * pageHeight);

      page.drawText(normalizedText, {
        x: x,
        y: y,
        size: adjustedFontSize,
        color: hexToRgb(overlay.color),
      });
    } catch (fallbackError) {
      console.error('Fallback drawing also failed:', fallbackError);
    }
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