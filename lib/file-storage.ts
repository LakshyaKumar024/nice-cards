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

export async function generatePdfFromSvgUrl(fileId: string, svgUrl: string, pdfFilename: string): Promise<boolean> {
  let browser;
  try {
    console.log('🔄 Starting Puppeteer to convert SVG URL to PDF...');
    
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to the SVG URL
    console.log('🌐 Navigating to SVG URL:', svgUrl);
    await page.goto(svgUrl, { waitUntil: 'networkidle0' });
    
    // Wait for SVG to load completely
    await page.waitForSelector('svg', { timeout: 10000 });
    
    // Get SVG dimensions for proper PDF sizing
    const dimensions = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      if (!svg) return { width: 800, height: 600 };
      
      const viewBox = svg.getAttribute('viewBox');
      let width = 800;
      let height = 600;
      
      if (viewBox) {
        const parts = viewBox.split(' ');
        width = parseFloat(parts[2]) || 800;
        height = parseFloat(parts[3]) || 600;
      } else {
        width = parseFloat(svg.getAttribute('width') || svg.getBoundingClientRect().width.toString() || '800');
        height = parseFloat(svg.getAttribute('height') || svg.getBoundingClientRect().height.toString() || '600');
      }
      
      return { width, height };
    });

    console.log('📐 SVG dimensions:', dimensions);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      width: Math.ceil(dimensions.width) + 40, // Add padding
      height: Math.ceil(dimensions.height) + 40,
      printBackground: true,
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    });

    await browser.close();

    // Save PDF to private tmp folder
    const pdfFileName = `${fileId}.pdf`;
    const pdfFilePath = path.join(privateTmpPath, pdfFileName);
    await fs.promises.writeFile(pdfFilePath, pdfBuffer);

    // Update metadata with PDF file info
    const metaFilePath = path.join(privateTmpPath, `${fileId}.json`);
    if (fs.existsSync(metaFilePath)) {
      const metadata = JSON.parse(await fs.promises.readFile(metaFilePath, 'utf8'));
      metadata.pdfFileName = pdfFileName;
      metadata.filename = pdfFilename; // Ensure PDF filename is set
      metadata.status = 'pdf_created';
      metadata.pdfCreatedAt = Date.now();
      await fs.promises.writeFile(metaFilePath, JSON.stringify(metadata));
    }

    console.log('✅ PDF conversion successful:', pdfFileName);
    return true;

  } catch (error) {
    console.error('❌ Error converting SVG URL to PDF:', error);
    if (browser) {
      await browser.close();
    }
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
    console.log("status",   metadata.status);
    
    return (metadata.status === 'pdf_created' && metadata.pdfFileName);
  } catch (error) {
    console.log(error);
    
    return false;
  }
}