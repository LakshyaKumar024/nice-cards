const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '../public/fonts');
const outputFile = path.join(__dirname, '../app/fonts.css');

// Get all font files
const fontFiles = fs.readdirSync(fontsDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
});

let css = '\n';

fontFiles.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  const nameWithoutExt = path.basename(file, ext);
  
  // Clean up font family name
  let fontFamily = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Determine format
  let format = 'truetype';
  if (ext === '.otf') format = 'opentype';
  if (ext === '.woff') format = 'woff';
  if (ext === '.woff2') format = 'woff2';
  
  css += `@font-face {
  font-family: "${fontFamily}";
  src: url("/fonts/${file}") format("${format}");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

`;
});

fs.writeFileSync(outputFile, css);
console.log(`Generated fonts.css with ${fontFiles.length} fonts`);
