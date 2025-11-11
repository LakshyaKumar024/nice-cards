import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
    try {
        // Get filename from query parameters
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');
        console.log("Requested filename:", filename);

        if (!filename) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing filename query parameter"
                },
                { status: 400 }
            );
        }

        // 1. Validate the filename
        if (!filename.endsWith(".svg")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid file type",
                    details: "File must be a .svg file"
                }, { status: 400 })
        }

        // 2. Check if user has permission to access this file
        // TODO: Implement user authentication

        // 3. Fetch the SVG file from your storage (S3, local filesystem, etc.)
        const filePath = path.join(process.cwd(), "private", "designs", "design", "svg", filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({
                success: false,
                error: "File not found",
                details: "File not found in storage"
            }, { status: 404 });
        }

        // Read the SVG file content
        const svgContent = fs.readFileSync(filePath, 'utf8');
        
        // Find all {{}} patterns and extract the content inside
        const placeholderPattern = /\{\{([^}]+)\}\}/g;
        const placeholders: string[] = [];
        let match;

        while ((match = placeholderPattern.exec(svgContent)) !== null) {
            placeholders.push(match[1].trim());
        }

        // Process placeholders: remove underscores and convert to capitalized words
        const processedPlaceholders = placeholders.map(placeholder => {
            // Remove underscores and split into words
            const words = placeholder.replace(/_/g, ' ').split(' ');
            
            // Capitalize each word
            const capitalizedWords = words.map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            );
            
            return capitalizedWords.join(' ');
        });

        // Return all processed placeholders including duplicates
        return NextResponse.json({
            success: true,
            message: "SVG file processed successfully",
            data: {
                filename,
                placeholders: processedPlaceholders, // Processed placeholders
                totalPlaceholders: processedPlaceholders.length,
                requestedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("Error in GET /api/getSvg:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}