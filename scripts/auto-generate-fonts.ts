import fs from "fs";
import path from "path";
import opentype from "opentype.js";

const fontsDir = path.join(process.cwd(), "public", "fonts");
const outDir = path.join(process.cwd(), "public", "fontsDeclaration");

fs.mkdirSync(outDir, { recursive: true });

const outputFile = path.join(outDir, "fonts.css");

let css = "";
const files = fs.readdirSync(fontsDir);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();

  // Only parse supported formats
  if (![".ttf", ".otf"].includes(ext)) {
    console.warn(`⚠ Ignoring unsupported font: ${file}`);
    continue;
  }

  const filePath = path.join(fontsDir, file);

  let fontFamily: string;

  try {
    // Try to parse font using opentype.js
    const font = opentype.loadSync(filePath);

    const realName =
      font.names.fullName?.en ||
      font.getEnglishName("fontFamily") ||
      font.getEnglishName("fullName");

    if (!realName) throw new Error("No name in font");

    fontFamily = realName.trim();
    console.log(`✔ Using REAL font name: ${fontFamily}`);
  } catch (err) {
    // Fallback: filename without extension
    fontFamily = path.basename(file, ext).replace(/[-_]+/g, " ").trim();
    console.warn(`⚠ opentype failed, using filename: ${fontFamily}`);
  }

  css += `
@font-face {
  font-family: "${fontFamily}";
  src: url("/fonts/${file}") format("${ext === ".otf" ? "opentype" : "truetype"}");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
`;
}

fs.writeFileSync(outputFile, css);
console.log("🎉 fonts.css generated successfully!");
