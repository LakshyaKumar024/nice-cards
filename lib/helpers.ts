// lib/helpers.ts
import { mkdir, writeFile } from "fs/promises";
import path from 'path';
import { uploadImageToCloudinary } from './cloudinary';

// Helper function to parse tags safely
function parseTags(tagsString: string | null): string[] {
    if (!tagsString) return [];

    try {
        // Handle both JSON array and comma-separated values
        if (tagsString.startsWith('[') && tagsString.endsWith(']')) {
            return JSON.parse(tagsString);
        } else if (tagsString.startsWith('tags : [')) {
            const jsonMatch = tagsString.match(/\[.*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } else {
            // Comma-separated fallback
            return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
    } catch (error) {
        console.error('Error parsing tags:', error);
        return [];
    }
}

/** Helper to get extension from MIME type */
function getImageExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/svg+xml": "svg",
        "application/pdf": "pdf",
    };
    return extensions[mimeType] || "bin";
}

/** Sanitize filename: remove unsafe chars, shorten, and trim */
function sanitizeFileName(name: string) {
    // Remove path separators and most non-alphanum chars (keep - _ .)
    const cleaned = name.replace(/[^a-zA-Z0-9-_.]/g, "-");
    // Trim and limit length to avoid very long names
    return cleaned.slice(0, 150);
}

/**
 * Save a file on disk and return the generated fileName.
 * For placeholder type, saves to Cloudinary and returns the URL.
 */
const saveFile = async (
    type: "pdf" | "placeholder" | "svg",
    filename: string,
    file: File
): Promise<string> => {
    // Handle placeholder images - save to Cloudinary and return URL
    if (type === "placeholder") {
        const imageUrl = await uploadImageToCloudinary(file);
        return imageUrl; // Return the Cloudinary URL directly
    }

    // Handle PDF and SVG files - save locally as before
    let fileDir: string;
    let generatedFileName: string;

    const ts = Date.now();
    const rand = Math.floor(Math.random() * 1e6);
    const baseName = sanitizeFileName(filename.replace(/\.[^/.]+$/, ""));

    switch (type) {
        case "pdf":
            fileDir = path.join(process.cwd(), "private", "designs", "design", "pdf");
            generatedFileName = `design-${baseName}-${ts}-${rand}.pdf`;
            break;

        case "svg":
            fileDir = path.join(process.cwd(), "private", "designs", "design", "svg");
            generatedFileName = `design-${baseName}-${ts}-${rand}.svg`;
            break;

        default:
            throw new Error(`Unsupported file type: ${type}`);
    }

    try {
        

        await mkdir(fileDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fullPath = path.join(fileDir, generatedFileName);

        await writeFile(fullPath, buffer);
        console.log("File saved successfully:", generatedFileName);

        return generatedFileName;
    } catch (err) {
        console.error("saveFile error:", err);
        throw new Error(`Failed to save file: ${err instanceof Error ? err.message : String(err)}`);
    }
};

export { 
    getImageExtension, 
    parseTags, 
    saveFile, 
    sanitizeFileName
};