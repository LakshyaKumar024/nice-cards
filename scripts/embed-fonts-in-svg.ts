import fs from "fs";
import path from "path";

export async function embedFontsInSvg(svgContent: string, fontDir: string) {
  // Replace <text font-family="X"> ... </text>
  // Extract the font names used so we know which fonts to embed
  const fontRegex = /font-family="([^"]+)"/g;

  const fontNames = new Set<string>();
  let match;

  while ((match = fontRegex.exec(svgContent)) !== null) {
    fontNames.add(match[1].trim());
  }

  console.log("Fonts detected in SVG:", fontNames);

  let fontFaceCSS = "";

  for (const fontName of fontNames) {
    // The .ttf filename should match the font name or YOU generate correct names earlier
    const fontFile = findFontFile(fontDir, fontName);

    if (!fontFile) {
      console.warn("Font not found:", fontName);
      continue;
    }

    const fontPath = path.join(fontDir, fontFile);

    console.log("Embedding:", fontPath);

    // Read and convert to base64
    const fontData = fs.readFileSync(fontPath);
    const base64 = fontData.toString("base64");

    fontFaceCSS += `
@font-face {
  font-family: "${fontName}";
  src: url("data:font/ttf;base64,${base64}") format("truetype");
  font-weight: normal;
  font-style: normal;
}
`;
  }

  // Inject into <svg>
  return svgContent.replace(
    "<svg",
    `<svg>
  <style>
  ${fontFaceCSS}
  </style>`
  );
}

// Finds the font file in folder
function findFontFile(fontDir: string, fontName: string): string | null {
  const files = fs.readdirSync(fontDir);

  for (const f of files) {
    const lower = f.toLowerCase();
    const cleanName = fontName.toLowerCase().replace(/\s+/g, "");

    if (lower.includes(cleanName)) {
      return f;
    }
  }

  return null;
}
