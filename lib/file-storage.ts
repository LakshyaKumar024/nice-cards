import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Paths for storage
const publicTmpPath = path.join(process.cwd(), 'public', 'tmp');
const privateTmpPath = path.join(process.cwd(), 'tmp', 'download-links');

// Ensure directories exist
if (!fs.existsSync(publicTmpPath)) {
  fs.mkdirSync(publicTmpPath, { recursive: true });
}
if (!fs.existsSync(privateTmpPath)) {
  fs.mkdirSync(privateTmpPath, { recursive: true });
}

export async function storeTemporarySvg(fileId: string, svgContent: string): Promise<string | null> {
  try {
    // Save SVG to public/tmp folder
    const svgFileName = `${fileId}.svg`;
    const svgFilePath = path.join(publicTmpPath, svgFileName);

    await fs.promises.writeFile(svgFilePath, svgContent, 'utf8');

    // Create metadata in private tmp folder
    const metaFilePath = path.join(privateTmpPath, `${fileId}.json`);
    const metadata = {
      svgFileName: svgFileName,
      pdfFileName: null as string | null,
      filename: `custom-design-${fileId}.pdf`, // Always set PDF as target filename
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: Date.now(),
      status: 'svg_created' // Track status
    };

    await fs.promises.writeFile(metaFilePath, JSON.stringify(metadata));

    console.log('💾 Stored temporary SVG file:', svgFileName);

    // Return public URL for the SVG
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/tmp/${svgFileName}`;

  } catch (error) {
    console.error('❌ Error storing temporary SVG:', error);
    return null;
  }
}


export async function generatePdfFromSvgUrl(
  fileId: string,
  svgUrl: string,
  pdfFilename: string
): Promise<boolean> {
  let browser;
  try {
    console.log('🔄 Starting Puppeteer to convert SVG URL to PDF...');

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Fetch SVG content (because we will inline it inside HTML)
    console.log("📥 Fetching SVG content from:", svgUrl);
    const svgContent = await fetch(svgUrl).then(res => res.text());

    // Build HTML wrapper (fonts will load here)
    const html = `
    <html>
      <head>
        <link rel="stylesheet" href="${process.env.NEXT_PUBLIC_BASE_URL}/fontsDeclaration/fonts.css" />
        <style>
          body { margin: 0; padding: 0; }
          svg { width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
    `;

    // Load the HTML content
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    console.log("⏳ Fonts loaded in Puppeteer.");

    // Ensure SVG exists
    await page.waitForSelector('svg', { timeout: 10000 });

    // Get SVG dimensions AFTER it's inside HTML
    const dimensions = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const viewBox = svg.getAttribute('viewBox');

      if (viewBox) {
        const parts = viewBox.split(' ');
        return {
          width: parseFloat(parts[2]) || 800,
          height: parseFloat(parts[3]) || 600
        };
      }

      return {
        width: svg.getBoundingClientRect().width || 800,
        height: svg.getBoundingClientRect().height || 600
      };
    });

    console.log("📏 SVG Dimensions:", dimensions);

    // Match viewport to SVG
    await page.setViewport({
      width: Math.ceil(dimensions.width),
      height: Math.ceil(dimensions.height),
      deviceScaleFactor: 2
    });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    // Save PDF
    const pdfFileName = `${fileId}.pdf`;
    const pdfPath = path.join(privateTmpPath, pdfFileName);
    await fs.promises.writeFile(pdfPath, pdfBuffer);

    // Update metadata
    const metaPath = path.join(privateTmpPath, `${fileId}.json`);
    if (fs.existsSync(metaPath)) {
      const metadata = JSON.parse(await fs.promises.readFile(metaPath, "utf8"));
      metadata.pdfFileName = pdfFileName;
      metadata.filename = pdfFilename;
      metadata.status = "pdf_created";
      metadata.pdfCreatedAt = Date.now();
      await fs.promises.writeFile(metaPath, JSON.stringify(metadata));
    }

    console.log("✅ PDF converted:", pdfFilename);
    return true;

  } catch (error) {
    console.error('❌ Error converting SVG URL to PDF:', error);
    if (browser) await browser.close();
    return false;
  }
}


export async function getTemporaryFile(fileId: string) {
  try {
    const metaFilePath = path.join(privateTmpPath, `${fileId}.json`);

    // Check if metadata file exists
    if (!fs.existsSync(metaFilePath)) {
      console.log('❌ Temporary file metadata not found:', fileId);
      return null;
    }

    const metadata = JSON.parse(await fs.promises.readFile(metaFilePath, 'utf8'));

    // Check expiration
    if (Date.now() > metadata.expiresAt) {
      await cleanupFile(fileId, metadata);
      console.log('🗑️ Deleted expired file:', fileId);
      return null;
    }

    // Check if PDF file exists - this is mandatory for download
    if (!metadata.pdfFileName) {
      console.log('❌ PDF file not created yet for:', fileId);
      return null;
    }

    const pdfFilePath = path.join(privateTmpPath, metadata.pdfFileName);
    if (!fs.existsSync(pdfFilePath)) {
      console.log('❌ PDF file not found on disk:', pdfFilePath);
      return null;
    }

    console.log('✅ Retrieved PDF file for download:', fileId);
    return {
      filePath: pdfFilePath,
      filename: metadata.filename,
      contentType: 'application/pdf'
    };

  } catch (error) {
    console.error('❌ Error reading temporary file:', error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
async function cleanupFile(fileId: string, metadata: any) {
  try {
    const metaFilePath = path.join(privateTmpPath, `${fileId}.json`);
    const svgPublicPath = path.join(publicTmpPath, `${fileId}.svg`);
    const pdfPrivatePath = path.join(privateTmpPath, `${fileId}.pdf`);

    // Delete metadata file
    if (fs.existsSync(metaFilePath)) {
      await fs.promises.unlink(metaFilePath);
    }

    // Delete SVG file from public/tmp
    if (fs.existsSync(svgPublicPath)) {
      await fs.promises.unlink(svgPublicPath);
    }

    // Delete PDF file from private tmp
    if (fs.existsSync(pdfPrivatePath)) {
      await fs.promises.unlink(pdfPrivatePath);
    }

    console.log('🧹 Cleaned up files for:', fileId);
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}

export async function cleanupExpiredFiles() {
  try {
    const files = await fs.promises.readdir(privateTmpPath);
    const now = Date.now();
    let cleanedCount = 0;

    for (const file of files) {
      if (file.endsWith('.json')) {
        const fileId = file.replace('.json', '');
        const filePath = path.join(privateTmpPath, file);

        try {
          const data = await fs.promises.readFile(filePath, 'utf8');
          const metadata = JSON.parse(data);

          if (now > metadata.expiresAt) {
            await cleanupFile(fileId, metadata);
            cleanedCount++;
          }
        } catch (error) {
          // If file is corrupted, delete it and associated files
          console.log('Error during cleanup:', error);
          await cleanupFile(fileId, {});
        }
      }
    }

    console.log(`🧹 Cleaned up ${cleanedCount} expired files`);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Helper function to check if PDF is ready
export async function isPdfReady(fileId: string): Promise<boolean> {
  try {
    const metaFilePath = path.join(privateTmpPath, `${fileId}.json`);
    if (!fs.existsSync(metaFilePath)) return false;

    const metadata = JSON.parse(await fs.promises.readFile(metaFilePath, 'utf8'));
    console.log("status", metadata.status);

    return (metadata.status === 'pdf_created' && metadata.pdfFileName);
  } catch (error) {
    console.log(error);

    return false;
  }
}