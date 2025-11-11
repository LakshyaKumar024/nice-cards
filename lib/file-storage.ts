import fs from 'fs';
import path from 'path';

const storagePath = path.join(process.cwd(), 'tmp', 'download-links');

// Ensure directory exists
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

export async function storeTemporaryLink(downloadId: string, data: {
  svgContent: string;
  expiresAt: number;
  filename: string;
}) {
  try {
    const filePath = path.join(storagePath, `${downloadId}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(data));
    console.log('💾 Stored temporary link:', downloadId);
    return true;
  } catch (error) {
    console.error('❌ Error storing temporary link:', error);
    return false;
  }
}

export async function getTemporaryLink(downloadId: string) {
  try {
    const filePath = path.join(storagePath, `${downloadId}.json`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ Temporary link file not found:', downloadId);
      return null;
    }
    
    const data = await fs.promises.readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Check expiration
    if (Date.now() > parsed.expiresAt) {
      await fs.promises.unlink(filePath);
      console.log('🗑️ Deleted expired link:', downloadId);
      return null;
    }
    
    console.log('✅ Retrieved temporary link:', downloadId);
    return parsed;
  } catch (error) {
    console.error('❌ Error reading temporary link:', error);
    return null;
  }
}

export async function cleanupExpiredLinks() {
  try {
    const files = await fs.promises.readdir(storagePath);
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(storagePath, file);
        try {
          const data = await fs.promises.readFile(filePath, 'utf8');
          const parsed = JSON.parse(data);
          
          if (now > parsed.expiresAt) {
            await fs.promises.unlink(filePath);
            cleanedCount++;
          }
        } catch (error) {
          // If file is corrupted, delete it
          console.log(error);
          
          await fs.promises.unlink(filePath);
        }
      }
    }
    
    console.log(`🧹 Cleaned up ${cleanedCount} expired links`);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}