import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary and return the URL
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    console.log("☁️ Uploading to Cloudinary:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert buffer to base64
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'template-images',
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });
    
    console.log("✅ Cloudinary upload successful:", result.secure_url);

    // Return just the URL
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Upload failed'}`);
  }
};