import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Helper function to get file extension from MIME type
function getImageExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'application/pdf': 'pdf'
    };
    return extensions[mimeType] || 'bin';
}


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




const saveFile = async (type: "pdf" | "placeholder" | "svg", filename: string, file: File): Promise<string> => {
    let fileDir;
    let filterdFileName;

    // For Generating unique filenames.
    const datetime = new Date().getHours()

    switch (type) {
        case "pdf":
            fileDir = path.join(process.cwd(), 'private', 'designs', 'design', 'pdf');
            filterdFileName = `design-${filename}-${datetime}.pdf`;
            break
        case "svg":
            fileDir = path.join(process.cwd(), 'private', 'designs', 'design', 'svg');
            filterdFileName = `design-${filename}-${datetime}.svg`;
            break
        case "placeholder":
            fileDir = path.join(process.cwd(), 'public', 'placeholder', 'image');
            filterdFileName = `design-${filename}-${datetime}.${getImageExtension(file.type)}`;
            break
        default:
            throw new Error(`Unsupported file type: ${type}`);
    }

    try {
        await mkdir(fileDir, { recursive: true });

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const Path = path.join(fileDir, filterdFileName);

        await writeFile(Path, fileBuffer);
        return filterdFileName;
    } catch (error) {
        return ""
    }
}

export { getImageExtension, parseTags, saveFile };