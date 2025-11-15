import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// -----------------------------
// GLOBAL SETTINGS
// -----------------------------
const FONTS_CSS_PATH = path.join(process.cwd(), "public","fontsDeclaration", "fonts.css");
const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

// Cache the parsed font map
let fontMapCache: Record<string, string> | null = null;

// ----------------------------------------------------------
// STEP 1 → Parse fonts.css and build: fontFamily → fontFile
// ----------------------------------------------------------
function loadFontMap(): Record<string, string> {
  if (fontMapCache) return fontMapCache;

  const map: Record<string, string> = {};

  if (!fs.existsSync(FONTS_CSS_PATH)) {
    console.error("❌ fonts.css not found at:", FONTS_CSS_PATH);
    return {};
  }

  const css = fs.readFileSync(FONTS_CSS_PATH, "utf8");

  // Match:
  // @font-face { font-family: 'X'; src: url('/fonts/X.ttf'); }
  const regex =
    /font-family\s*:\s*['"](.+?)['"][^}]*?url\(['"](.+?)['"]\)/gs;

  let match;
  while ((match = regex.exec(css)) !== null) {
    const family = match[1].trim();
    const file = match[2].trim().split("/").pop()!;
    map[family] = file;
  }

  console.log("✓ Loaded fonts:", Object.keys(map));

  fontMapCache = map;
  return map;
}

// ----------------------------------------------------------
// STEP 2 → Detect fonts used inside the SVG
// ----------------------------------------------------------
function detectFonts(svg: string): Set<string> {
  const fonts = new Set<string>();
  let match;

  // Case 1 → font-family="X"
  const direct = /font-family="([^"]+)"/g;
  while ((match = direct.exec(svg)) !== null) {
    fonts.add(match[1].trim());
  }

  // Case 2 → style="font-family: X;"
  const styleInline = /font-family\s*:\s*['"]?([^"';}]+)['"]?/g;
  while ((match = styleInline.exec(svg)) !== null) {
    fonts.add(match[1].trim());
  }

  return fonts;
}

// ----------------------------------------------------------
// STEP 3 → Embed a single font (base64) into SVG
// ----------------------------------------------------------
function embedFont(svg: string, family: string, file: string): string {
  try {
    const abs = path.join(FONTS_DIR, file);

    if (!fs.existsSync(abs)) {
      console.warn(`⚠ Font file missing: ${abs}`);
      return svg;
    }

    const buf = fs.readFileSync(abs);
    const b64 = buf.toString("base64");
    const ext = file.split(".").pop()!.toLowerCase();

    const format =
      ext === "ttf"
        ? "truetype"
        : ext === "otf"
        ? "opentype"
        : ext === "woff"
        ? "woff"
        : "woff2";

    const inject = `
<style><![CDATA[
@font-face {
  font-family: '${family}';
  src: url("data:font/${format};base64,${b64}") format('${format}');
  font-weight: normal;
  font-style: normal;
}
]]></style>`;

    return svg.replace("<svg", `<svg>${inject}`);
  } catch (err) {
    console.error(`❌ Error embedding font '${family}':`, err);
    return svg;
  }
}

// ----------------------------------------------------------
// STEP 4 → Embed all detected fonts into SVG
// ----------------------------------------------------------
function embedFontsInSvg(svg: string): string {
  const map = loadFontMap();
  const used = detectFonts(svg);

  if (used.size === 0) {
    console.log("ℹ No fonts detected in SVG.");
    return svg;
  }

  console.log("📝 Fonts detected in SVG:", [...used]);

  let result = svg;

  for (const family of used) {
    const file = map[family];
    if (!file) {
      console.warn(`⚠ '${family}' not found in fonts.css`);
      continue;
    }
    result = embedFont(result, family, file);
  }

  return result;
}

// ==========================================================
// MAIN ROUTE HANDLER
// ==========================================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;

    // Security
    if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const svgPath = path.join(
      process.cwd(),
      "private",
      "designs",
      "design",
      "svg",
      file
    );

    if (!fs.existsSync(svgPath)) {
      return NextResponse.json({ error: "SVG not found" }, { status: 404 });
    }

    let svg = fs.readFileSync(svgPath, "utf8");

    // ⭐ Embed fonts
    svg = embedFontsInSvg(svg);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": "inline",
      },
    });
  } catch (err) {
    console.error("❌ Route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
