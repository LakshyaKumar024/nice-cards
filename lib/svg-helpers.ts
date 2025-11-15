// Conditional imports for server-side only
let fs: typeof import('fs') | null = null;
let path: typeof import('path') | null = null;

// Check if we're running on the server
const isServer = typeof window === 'undefined';

if (isServer) {
    fs = require('fs');
    path = require('path');
}

// Cache for parsed fonts to avoid re-parsing fonts.css on every request
let fontMappingsCache: Record<string, string> | null = null;

// Parse fonts.css and extract all font-family to file path mappings
function parseFontsCss(): Record<string, string> {
    if (fontMappingsCache) {
        return fontMappingsCache;
    }

    const fontMappings: Record<string, string> = {};
    
    if (!isServer || !fs || !path) {
        console.warn('⚠ Font parsing only available on server-side');
        return fontMappings;
    }
    
    try {
        const fontsCssPath = path.join(process.cwd(), 'app', 'fonts.css');
        const fontsCssContent = fs.readFileSync(fontsCssPath, 'utf-8');

        // Regex to match @font-face blocks
        const fontFaceRegex = /@font-face\s*\{[^}]*font-family:\s*["']([^"']+)["'][^}]*src:\s*url\(["']([^"']+)["']\)[^}]*\}/g;
        
        let match;
        while ((match = fontFaceRegex.exec(fontsCssContent)) !== null) {
            const fontFamily = match[1];
            const fontPath = match[2];
            
            // Only store the first occurrence of each font family
            if (!fontMappings[fontFamily]) {
                fontMappings[fontFamily] = fontPath;
            }
        }

        console.log(`✓ Parsed ${Object.keys(fontMappings).length} fonts from fonts.css`);
        fontMappingsCache = fontMappings;
        
    } catch (error) {
        console.error('❌ Error parsing fonts.css:', error);
    }

    return fontMappings;
}

// Extract font families used in the SVG
function extractFontsFromSvg(svgContent: string): Set<string> {
    const fontsUsed = new Set<string>();
    
    // Match font-family declarations in CSS
    const fontFamilyRegex = /font-family:\s*['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = fontFamilyRegex.exec(svgContent)) !== null) {
        fontsUsed.add(match[1]);
    }
    
    return fontsUsed;
}

// Helper function to embed fonts into SVG
function embedFontsInSvg(svgContent: string): string {
    console.log('🚀 embedFontsInSvg called, isServer:', isServer, 'fs:', !!fs, 'path:', !!path);
    
    // Only embed fonts on server-side
    if (!isServer || !fs || !path) {
        console.log('⚠ Font embedding skipped (client-side)');
        return svgContent;
    }

    try {
        // Check if fonts are already embedded
        if (svgContent.includes('@font-face')) {
            console.log('Fonts already embedded in SVG');
            return svgContent;
        }

        // Parse fonts.css to get all font mappings
        const allFontMappings = parseFontsCss();
        
        // Extract fonts used in this SVG
        const fontsUsed = extractFontsFromSvg(svgContent);
        console.log(`📝 Fonts used in SVG: ${Array.from(fontsUsed).join(', ')}`);

        let fontFaceRules = '';
        let embeddedCount = 0;

        // Only embed fonts that are actually used in the SVG
        for (const fontFamily of fontsUsed) {
            const fontPath = allFontMappings[fontFamily];
            
            if (!fontPath) {
                console.warn(`⚠ Font not found in fonts.css: ${fontFamily}`);
                console.log(`Available fonts:`, Object.keys(allFontMappings).filter(f => f.includes(fontFamily.split(' ')[0])));
                continue;
            }

            console.log(`🔍 Looking for font: ${fontFamily} at path: ${fontPath}`);
            const fullPath = path.join(process.cwd(), 'public', fontPath);

            // Check if font file exists
            if (fs.existsSync(fullPath)) {
                const fontBuffer = fs.readFileSync(fullPath);
                const base64Font = fontBuffer.toString('base64');
                
                // Determine format from file extension
                const ext = path.extname(fontPath).toLowerCase();
                const fontFormat = ext === '.otf' ? 'opentype' : 'truetype';

                fontFaceRules += `
    @font-face {
      font-family: '${fontFamily}';
      src: url(data:font/${fontFormat};base64,${base64Font}) format('${fontFormat}');
      font-weight: normal;
      font-style: normal;
    }`;
                embeddedCount++;
                console.log(`✓ Embedded font: ${fontFamily}`);
            } else {
                console.warn(`⚠ Font file not found: ${fullPath}`);
            }
        }

        // Insert font-face rules into the SVG style section
        if (fontFaceRules) {
            const styleRegex = /(<style[^>]*>\s*<!\[CDATA\[)/;
            if (styleRegex.test(svgContent)) {
                svgContent = svgContent.replace(styleRegex, `$1${fontFaceRules}`);
                console.log(`✓ Successfully embedded ${embeddedCount} fonts into SVG`);
            }
        }

        return svgContent;
    } catch (error) {
        console.error('❌ Error embedding fonts:', error);
        return svgContent; // Return original if embedding fails
    }
}

// Helper function to customize SVG with user data
function customizeSvg(svgTemplate: string, userData: URLSearchParams | object): string {
    console.log("customizeingSvg", userData);
    let customizedSvg = svgTemplate;

    // Replace each placeholder with user data
    if (userData instanceof URLSearchParams) {
        console.log("2");
        userData.forEach((value, key) => {
            const placeholder = `{{${key}}}`; // Assuming your SVG uses {{PLACEHOLDER}} syntax
            customizedSvg = customizedSvg.replace(new RegExp(placeholder, 'g'), value);
        });
    } else {
        console.log("1");

        for (const [key, value] of Object.entries(userData)) {
            const placeholder = `{{${key}}}`; // Assuming your SVG uses {{PLACEHOLDER}} syntax
            customizedSvg = customizedSvg.replace(new RegExp(placeholder, 'g'), value as string);
            console.log("work done");
        }
    }

    // Embed fonts before returning
    customizedSvg = embedFontsInSvg(customizedSvg);

    return customizedSvg;
}

export { customizeSvg, embedFontsInSvg };