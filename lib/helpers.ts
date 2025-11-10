import { mkdir, writeFile } from "fs/promises";
import path from "path";

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
 * Throws on error so caller can respond with a 500 and helpful log.
 */
const saveFile = async (
    type: "pdf" | "placeholder" | "svg",
    filename: string,
    file: File
): Promise<string> => {
    let fileDir: string;
    let generatedFileName: string;

    // create a unique suffix with timestamp + random
    const ts = Date.now(); // milliseconds
    const rand = Math.floor(Math.random() * 1e6); // random number to avoid collisions

    // sanitize the client filename (without extension)
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

        case "placeholder":
            fileDir = path.join(process.cwd(), "public", "placeholder", "image");
            const ext = getImageExtension(file.type) || "png";
            generatedFileName = `design-${baseName}-${ts}-${rand}.${ext}`;
            break;

        default:
            throw new Error(`Unsupported file type: ${type}`);
    }

    try {
        // ensure directory exists
        await mkdir(fileDir, { recursive: true });

        // convert to buffer and write
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fullPath = path.join(fileDir, generatedFileName);

        await writeFile(fullPath, fileBuffer);

        // return the file name (not full path)
        return generatedFileName;
    } catch (err) {
        // Helpful logging for server-side debugging
        console.error("saveFile error:", {
            message: err instanceof Error ? err.message : String(err),
            type,
            filename: generatedFileName,
            targetDir: fileDir,
            originalName: filename,
        });
        // Rethrow so the caller (PUT handler) can return a proper 500 and include details if needed
        throw new Error("Failed to save file on server");
    }
};


export { getImageExtension, parseTags, saveFile, sanitizeFileName };