import fs from "fs/promises";
import path from "path";

let fontMapCache: Record<string, string> | null = null;

/**
 * Reads fonts.css once and creates a map like:
 * {
 *   "KrutiDev010": "KrutiDev010.ttf",
 *   "Mangal": "Mangal-Regular.woff2",
 *   ...
 * }
 */
export async function getFontMap() {
  if (fontMapCache) return fontMapCache;

  const cssPath = path.join(process.cwd(), "public", "fonts.css");
  const css = await fs.readFile(cssPath, "utf-8");

  const map: Record<string, string> = {};

  // Regex to capture font-family + src
  const fontFaceRegex = /font-family:\s*['"](.+?)['"].+?url\(['"](.+?)['"]\)/gs;

  let match;
  while ((match = fontFaceRegex.exec(css)) !== null) {
    const fontFamily = match[1].trim();
    let fontFile = match[2].trim();

    // Only filename, ignore paths
    fontFile = fontFile.split("/").pop()!;

    map[fontFamily] = fontFile;
  }

  fontMapCache = map;
  return map;
}

