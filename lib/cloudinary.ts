import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CLOUDINARY_PDF_FOLDER =
  process.env.CLOUDINARY_PDF_FOLDER || 'template-pdfs';
export const CLOUDINARY_IMAGE_FOLDER =
  process.env.CLOUDINARY_IMAGE_FOLDER || 'template-images';

export interface SignatureOptions {
  type: 'pdf' | 'image';
  customFolder?: string;
  customPublicId?: string;
}

export interface SignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
}

/**
 * Generate a signed upload signature for direct browser-to-Cloudinary uploads
 */
export const generateUploadSignature = ({
  type,
  customFolder,
  customPublicId,
}: SignatureOptions): SignatureResult => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error('Cloudinary environment variables are missing on the server');
  }

  const folder =
    customFolder || (type === 'pdf' ? CLOUDINARY_PDF_FOLDER : CLOUDINARY_IMAGE_FOLDER);

  const prefix = type === 'pdf' ? 'pdf_' : 'img_';
  const publicId =
    customPublicId || `${prefix}${crypto.randomBytes(8).toString('hex')}_${Date.now()}`;

  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    publicId,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
  };
};

/**
 * Upload image to Cloudinary (server-side helper)
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    console.log("☁️ Uploading image to Cloudinary:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniquePublicId =
      "img_" + crypto.randomBytes(12).toString("hex") + "_" + Date.now();

    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: CLOUDINARY_IMAGE_FOLDER,
      public_id: uniquePublicId,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      tags: ['template_image'],
    });

    console.log("✅ Cloudinary image upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary image upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Upload failed'}`);
  }
};

/**
 * Upload PDF to Cloudinary and return the secure URL (server-side helper)
 */
export const uploadPdfToCloudinary = async (file: File): Promise<string> => {
  try {
    console.log("☁️ Uploading PDF to Cloudinary:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniquePublicId =
      "pdf_" + crypto.randomBytes(12).toString("hex") + "_" + Date.now();

    const base64String = `data:application/pdf;base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: CLOUDINARY_PDF_FOLDER,
      public_id: uniquePublicId,
      resource_type: "auto",
      tags: ["template_pdf", `uploaded_at_${Date.now()}`],
      context: {
        uploadedAt: String(Date.now()),
        type: "template_pdf",
      },
    });

    console.log("✅ Cloudinary PDF upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary PDF upload error:', error);
    throw new Error(`Failed to upload PDF: ${error instanceof Error ? error.message : 'Upload failed'}`);
  }
};

/**
 * Extract Cloudinary public_id from a Cloudinary URL
 * Example: https://res.cloudinary.com/<cloud_name>/image/upload/v1793819495/template-pdfs/pdf_abc.pdf
 * Returns: "template-pdfs/pdf_abc"
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1].replace(/^(?:[a-z]_[^/]+\/)*v\d+\//, '');
    return pathAfterUpload.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

/**
 * Delete an asset from Cloudinary by URL or public_id
 */
export const deleteFromCloudinary = async (
  publicIdOrUrl: string,
  resourceType: "image" | "raw" | "video" = "image"
): Promise<boolean> => {
  try {
    const publicId = publicIdOrUrl.startsWith('http')
      ? getPublicIdFromUrl(publicIdOrUrl)
      : publicIdOrUrl;

    if (!publicId) return false;

    console.log(`🗑️ Deleting from Cloudinary (${resourceType}):`, publicId);

    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (res.result === 'ok') {
      console.log('✅ Successfully deleted from Cloudinary:', publicId);
      return true;
    }

    // Fallback: try raw if image wasn't found
    if (resourceType === 'image') {
      const rawRes = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
      });
      return rawRes.result === 'ok';
    }

    return false;
  } catch (error) {
    console.error('❌ Failed to delete from Cloudinary:', error);
    return false;
  }
};

export default cloudinary;
