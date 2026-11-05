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
import type { Overlay, TextOverlay, ShapeOverlay, ImageOverlay } from '@/lib/types';
import { loadCustomFont, isCustomFont } from './custom-fonts';


const EXPLICIT_POSITION_ADDITION = Number(process.env.NEXT_PUBLIC_EXPLICIT_POSITION_ADDITION??7); // Adjust this value as needed (positive = move up)
const EXPLICIT_POSITION_LEFT = Number(process.env.NEXT_PUBLIC_EXPLICIT_POSITION_LEFT??2); // Adjust this value as needed (positive = move up)


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
        await drawTextOverlay(page, overlay, width, height, fontCache, pdfDoc);
      } else if (overlay.type === 'shape' && overlay.shapeType === 'square') {
        await drawShapeOverlay(page, overlay, width, height);
      } else if (overlay.type === 'image') {
        await drawImageOverlay(page, overlay, width, height, pdfDoc);
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
  fontCache: Map<string, any>,
  pdfDoc?: PDFDocument
) {
  try {
    const rawText = overlay.text || "";
    const CANVAS_SCALE = 1.5;
    const defaultFontSize = overlay.fontSize / CANVAS_SCALE;
    const lineHeight = defaultFontSize * 1.25;

    // canvas anchor is CENTER of the text box with translate(-50%, -50%)
    const centerX = overlay.x * pageWidth;
    const centerY = pageHeight - overlay.y * pageHeight;

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawText, "text/html");

    // ========== HELPER: SELECT FONT FROM CACHE ==========
    function resolveFont(fontFamily: string | null, isBold: boolean, isItalic: boolean) {
      if (!fontFamily) return [...fontCache.values()][0];
      let key = fontFamily;

      if (isBold && isItalic) key += "-bolditalic";
      else if (isBold) key += "-bold";
      else if (isItalic) key += "-italic";

      return (
        fontCache.get(key) ||
        fontCache.get(fontFamily) ||
        fontCache.get(fontFamily.replace(/\s+/g, "")) ||
        [...fontCache.values()][0]
      );
    }

    // ========== PRE-LOAD & EMBED IMAGES (preserve exact aspect & dimensions) ==========
    const imgMap = new Map<string, { image: any; width: number; height: number }>();
    if (pdfDoc) {
      const imgElements = Array.from(doc.querySelectorAll("img"));
      for (const imgEl of imgElements) {
        const src = imgEl.getAttribute("src");
        if (!src || imgMap.has(src)) continue;

        try {
          let bytes: Uint8Array | null = null;
          let isPng = false;

          if (src.startsWith("data:")) {
            const parts = src.split(",");
            isPng = parts[0].includes("image/png");
            const base64Data = parts[1];
            if (base64Data) {
              const bin = atob(base64Data);
              bytes = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) {
                bytes[i] = bin.charCodeAt(i);
              }
            }
          } else {
            const resp = await fetch(src);
            const arrayBuf = await resp.arrayBuffer();
            bytes = new Uint8Array(arrayBuf);
            const contentType = resp.headers.get("content-type") || "";
            isPng = contentType.includes("png") || src.toLowerCase().includes(".png");
          }

          if (bytes) {
            if (
              !isPng &&
              bytes.length > 8 &&
              bytes[0] === 0x89 &&
              bytes[1] === 0x50 &&
              bytes[2] === 0x4e &&
              bytes[3] === 0x47
            ) {
              isPng = true;
            }

            const embedded = isPng
              ? await pdfDoc.embedPng(bytes)
              : await pdfDoc.embedJpg(bytes);

            // Container constraint: on canvas max width is 80% page width, max height in Slate is 260px
            const maxContainerWidth = pageWidth * 0.8;
            const maxContainerHeight = 260 / CANVAS_SCALE;
            const imgAspect = embedded.width / embedded.height;

            let specifiedW = 0;
            let specifiedH = 0;
            if (imgEl.style.width && !imgEl.style.width.includes("%")) {
              specifiedW = parseFloat(imgEl.style.width) / CANVAS_SCALE;
            } else if (imgEl.getAttribute("width")) {
              specifiedW = parseFloat(imgEl.getAttribute("width")!) / CANVAS_SCALE;
            }

            if (imgEl.style.height && !imgEl.style.height.includes("%")) {
              specifiedH = parseFloat(imgEl.style.height) / CANVAS_SCALE;
            } else if (imgEl.getAttribute("height")) {
              specifiedH = parseFloat(imgEl.getAttribute("height")!) / CANVAS_SCALE;
            }

            let drawW = specifiedW || embedded.width;
            let drawH = specifiedH || embedded.height;

            if (!specifiedW && !specifiedH) {
              if (drawW > maxContainerWidth) {
                drawW = maxContainerWidth;
                drawH = drawW / imgAspect;
              }
              if (drawH > maxContainerHeight) {
                drawH = maxContainerHeight;
                drawW = drawH * imgAspect;
              }
            } else if (specifiedW && !specifiedH) {
              drawH = specifiedW / imgAspect;
            } else if (!specifiedW && specifiedH) {
              drawW = specifiedH * imgAspect;
            }

            imgMap.set(src, {
              image: embedded,
              width: drawW,
              height: drawH,
            });
          }
        } catch (imgErr) {
          console.error("Failed to embed image into PDF for printing:", imgErr);
        }
      }
    }

    // ========== PARSE HTML INTO ORDERED FLOW ITEMS (text lines & images) ==========
    type FlowItem =
      | {
          type: "line";
          segments: Array<{
            text: string;
            font: any;
            width: number;
            fontSize: number;
            color: string;
          }>;
          width: number;
          height: number;
        }
      | {
          type: "image";
          image: any;
          width: number;
          height: number;
        };

    const flowItems: FlowItem[] = [];
    let currentLine: Array<{
      text: string;
      font: any;
      width: number;
      fontSize: number;
      color: string;
    }> = [];

    const flushCurrentLine = () => {
      if (currentLine.length > 0) {
        const cleaned = currentLine.filter((s) => s.text.trim() !== "" || s.text === " ");
        const lineWidth = cleaned.reduce((total, seg) => total + seg.width, 0);
        flowItems.push({
          type: "line",
          segments: [...currentLine],
          width: lineWidth,
          height: lineHeight,
        });
        currentLine = [];
      }
    };

    function walk(
      node: any,
      currentFontFamily: string | null,
      currentBold: boolean = false,
      currentItalic: boolean = false,
      currentFontSize: number | null = null,
      currentColor: string | null = null,
      isBlockElement: boolean = false
    ) {
      if (isBlockElement) {
        flushCurrentLine();
      }

      for (const child of node.childNodes) {
        if (child.nodeType === 3) {
          // TEXT_NODE
          const text = child.textContent || "";
          if (text) {
            const segFontSize = currentFontSize ? currentFontSize / CANVAS_SCALE : defaultFontSize;
            const font = resolveFont(currentFontFamily, currentBold, currentItalic);

            if (text.includes("\n")) {
              const parts = text.split("\n");
              for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part) {
                  currentLine.push({
                    text: part,
                    font,
                    width: font.widthOfTextAtSize(part, segFontSize),
                    fontSize: segFontSize,
                    color: currentColor || overlay.color,
                  });
                }
                if (i < parts.length - 1) {
                  flushCurrentLine();
                }
              }
            } else {
              currentLine.push({
                text,
                font,
                width: font.widthOfTextAtSize(text, segFontSize),
                fontSize: segFontSize,
                color: currentColor || overlay.color,
              });
            }
          }
        } else if (child.nodeType === 1) {
          // ELEMENT_NODE
          const el = child as HTMLElement;

          if (el.tagName === "IMG") {
            flushCurrentLine();
            const src = el.getAttribute("src");
            if (src && imgMap.has(src)) {
              const imgData = imgMap.get(src)!;
              flowItems.push({
                type: "image",
                image: imgData.image,
                width: imgData.width,
                height: imgData.height,
              });
            }
            continue;
          }

          let chosenFont = el.getAttribute("data-font") || currentFontFamily;
          if (!chosenFont && el.style.fontFamily) {
            chosenFont = el.style.fontFamily.replace(/['"]/g, "").split(",")[0].trim();
          }

          let isBold = currentBold;
          if (
            el.style.fontWeight === "bold" ||
            el.style.fontWeight === "700" ||
            el.tagName === "STRONG" ||
            el.tagName === "B"
          ) {
            isBold = true;
          }

          let isItalic = currentItalic;
          if (
            el.style.fontStyle === "italic" ||
            el.tagName === "EM" ||
            el.tagName === "I"
          ) {
            isItalic = true;
          }

          let fontSize = currentFontSize;
          if (el.style.fontSize) {
            const sizeMatch = el.style.fontSize.match(/(\d+)/);
            if (sizeMatch) {
              fontSize = parseInt(sizeMatch[1]);
            }
          }

          let color = currentColor;
          if (el.style.color) {
            color = el.style.color;
          }

          const isBlock = [
            "DIV",
            "P",
            "H1",
            "H2",
            "H3",
            "H4",
            "H5",
            "H6",
            "UL",
            "OL",
            "LI",
            "SECTION",
            "ARTICLE",
          ].includes(el.tagName);

          if (el.tagName === "BR") {
            flushCurrentLine();
          } else {
            walk(el, chosenFont, isBold, isItalic, fontSize, color, isBlock);
          }

          if (isBlock) {
            flushCurrentLine();
          }
        }
      }
    }

    walk(doc.body, overlay.fontFamily, overlay.bold, overlay.italic, null, null, false);
    flushCurrentLine();

    // ========== POSITIONING & BOUNDING BOX ==========
    const maxContentWidth = Math.max(
      ...flowItems.map((item) => item.width),
      0
    );

    let totalHeight = 0;
    flowItems.forEach((item) => {
      if (item.type === "line") {
        totalHeight += item.height;
      } else if (item.type === "image") {
        totalHeight += item.height + 6; // 6pt vertical spacing
      }
    });

    const boxX = centerX - maxContentWidth / 2 - EXPLICIT_POSITION_LEFT;
    const boxBottomY = centerY - totalHeight / 2 + EXPLICIT_POSITION_ADDITION;
    const boxTopY = boxBottomY + totalHeight;

    function getAlignedX(itemWidth: number) {
      if (overlay.textAlign === "center") {
        return boxX + (maxContentWidth - itemWidth) / 2;
      } else if (overlay.textAlign === "right") {
        return boxX + (maxContentWidth - itemWidth);
      }
      return boxX;
    }

    // ========== DRAW FUNCTION ==========
    const drawEverything = () => {
      let currentY = boxTopY;

      flowItems.forEach((item) => {
        if (item.type === "line") {
          currentY -= item.height;
          const x = getAlignedX(item.width);

          let cursorX = x;
          for (const seg of item.segments) {
            if (seg.text.trim() !== "" || seg.text === " ") {
              page.drawText(seg.text, {
                x: cursorX,
                y: currentY,
                font: seg.font,
                size: seg.fontSize,
                color: hexToRgb(seg.color),
              });
            }
            cursorX += seg.width;
          }
        } else if (item.type === "image") {
          currentY -= 3;
          currentY -= item.height;
          const imgX = getAlignedX(item.width);

          page.drawImage(item.image, {
            x: imgX,
            y: currentY,
            width: item.width,
            height: item.height,
          });

          currentY -= 3;
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

async function drawImageOverlay(
  page: any,
  overlay: ImageOverlay,
  pageWidth: number,
  pageHeight: number,
  pdfDoc: PDFDocument
) {
  try {
    const boxWidth = overlay.width * pageWidth;
    const boxHeight = overlay.height * pageHeight;

    // In canvas, overlays are centered at (overlay.x * pageWidth, overlay.y * pageHeight)
    // with translate(-50%, -50%) and rotate(overlay.rotation deg)
    const centerX = overlay.x * pageWidth;
    const centerY = pageHeight - overlay.y * pageHeight;

    let imageBytes: Uint8Array;
    let isPng = false;

    if (overlay.imageUrl.startsWith("data:")) {
      const parts = overlay.imageUrl.split(",");
      const mime = parts[0];
      isPng = mime.includes("image/png");
      const base64Data = parts[1];
      const binaryString = atob(base64Data);
      imageBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imageBytes[i] = binaryString.charCodeAt(i);
      }
    } else {
      const response = await fetch(overlay.imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      imageBytes = new Uint8Array(arrayBuffer);
      const contentType = response.headers.get("content-type") || "";
      isPng =
        contentType.includes("png") ||
        overlay.imageUrl.toLowerCase().includes(".png");
    }

    // Check PNG magic bytes: 0x89, 0x50, 0x4E, 0x47
    if (
      imageBytes.length >= 4 &&
      imageBytes[0] === 0x89 &&
      imageBytes[1] === 0x50 &&
      imageBytes[2] === 0x4e &&
      imageBytes[3] === 0x47
    ) {
      isPng = true;
    }

    let embeddedImage;
    if (isPng) {
      // pdf-lib's embedPng natively preserves PNG transparency / alpha channel (SMask)
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      try {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } catch {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      }
    }

    // Preserve exact aspect ratio matching CSS object-fit: contain on canvas
    const imgAspect = embeddedImage.width / embeddedImage.height;
    const boxAspect = boxWidth / boxHeight;

    let drawWidth = boxWidth;
    let drawHeight = boxHeight;

    if (boxAspect > imgAspect) {
      drawHeight = boxHeight;
      drawWidth = boxHeight * imgAspect;
    } else {
      drawWidth = boxWidth;
      drawHeight = boxWidth / imgAspect;
    }

    const drawX = centerX - drawWidth / 2;
    const drawY = centerY - drawHeight / 2;

    if (overlay.rotation !== 0) {
      const radians = -(overlay.rotation * Math.PI) / 180;

      page.pushOperators(pushGraphicsState());
      page.pushOperators(translate(centerX, centerY));
      page.pushOperators(rotateRadians(radians));
      page.pushOperators(translate(-centerX, -centerY));

      page.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
      });

      page.pushOperators(popGraphicsState());
    } else {
      page.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
      });
    }
  } catch (err) {
    console.error("Error drawing image overlay in PDF export:", err);
  }
}
