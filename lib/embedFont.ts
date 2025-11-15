
import fs from "fs/promises";
import path from "path";

// Convert font file → Base64 string
export async function fontToBase64(fontPath: string) {
  const file = await fs.readFile(fontPath);
  return file.toString("base64");
}

// Inject @font-face into <svg> before first <g> or </svg>
export async function embedFontInSvg(svg: string, fontFamily: string, fontFilename: string) {
  const absPath = path.join(process.cwd(), "public", "fonts", fontFilename);

  const base64 = await fontToBase64(absPath);

  const ext = fontFilename.split(".").pop();
  const mime =
    ext === "ttf"
      ? "font/ttf"
      : ext === "woff"
      ? "font/woff"
      : "font/woff2";

  const fontFace = `
<style>
@font-face {
  font-family: "${fontFamily}";
  src: url("data:${mime};base64,${base64}") format("${ext}");
  font-weight: normal;
  font-style: normal;
}
</style>
`;

  // Insert <style> right after opening <svg ...>
  return svg.replace("<svg", `<svg>${fontFace}`);
}

