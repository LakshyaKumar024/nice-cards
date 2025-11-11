import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db-init';
import { storeTemporaryLink, cleanupExpiredLinks } from '@/lib/file-storage';


console.log('🔄 API route loaded: /api/design/[designId]/edit/[sno]');



export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ designId: string; sno: string }> }
) {
    try {
        const { designId, sno } = await params;
        const searchParams = request.nextUrl.searchParams;

        console.log('📥 Received request for design:', { designId, sno });
        console.log('🔍 Search params:', Object.fromEntries(searchParams.entries()));

        // 1. Get the original SVG file
        const svgFileName = await getSvgFileName(designId, sno);
        console.log('📄 SVG filename from DB:', svgFileName);

        if (!svgFileName) {
            return NextResponse.json(
                { error: 'SVG template not found' },
                { status: 404 }
            );
        }

        // 2. Read the SVG template
        const svgTemplate = await getSvgTemplate(svgFileName);
        console.log('📏 SVG template length:', svgTemplate?.length || 0);

        if (!svgTemplate) {
            return NextResponse.json(
                { error: 'SVG file not found' },
                { status: 404 }
            );
        }

        // 3. Replace placeholders in SVG with user data
        const customizedSvg = customizeSvg(svgTemplate, searchParams);
        console.log('🎨 Customized SVG length:', customizedSvg.length);

        // 4. Generate temporary download link
        const downloadId = `${designId}-${sno}-${Date.now()}`;
        const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/download/${downloadId}`;

        console.log('🔗 Generated download info:', {
            downloadId,
            downloadUrl,
            filename: `custom-design-${designId}-${sno}.svg`
        });

        // 5. Store the customized SVG in file storage
        const storageSuccess = await storeTemporaryLink(downloadId, {
            svgContent: customizedSvg,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            filename: `custom-design-${designId}-${sno}.svg`
        });

        if (!storageSuccess) {
            return NextResponse.json(
                { error: 'Failed to create download link' },
                { status: 500 }
            );
        }

        // 6. Clean up expired links
        await cleanupExpiredLinks();

        return NextResponse.json({
            success: true,
            downloadUrl: downloadUrl,
            downloadId: downloadId, // Include for debugging
            message: 'Design customized successfully. Your download will start automatically.',
            expiresIn: '24 hours'
        });

    } catch (error) {
        console.error('❌ Error processing design:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}




// Helper function to get SVG filename from your database
async function getSvgFileName(designId: string, sno: string): Promise<string | null> {
    // Implement your logic to get SVG filename from database
    // This is just an example - replace with your actual implementation
    try {
        console.log(designId);

        const template = await prisma.template.findFirst({
            where: { uuid: designId },
            select: {
                svg: true,
            }
        });
        if (!template) {
            console.error('Error fetching SVG filename:',);
            return null
        }

        const svg = JSON.parse(template?.svg as string)[sno];
        console.log("SVG -->", svg);



        return svg;
    } catch (error) {
        console.error('Error fetching SVG filename:', error);
        return null;
    }
}

// Helper function to read SVG template
async function getSvgTemplate(filename: string): Promise<string | null> {
    try {
        // Adjust the path according to your file structure
        const filePath = path.join(process.cwd(), 'private', 'designs', 'design', 'svg', filename);
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading SVG file:', error);
        return null;
    }
}

// Helper function to customize SVG with user data
function customizeSvg(svgTemplate: string, userData: URLSearchParams): string {
    let customizedSvg = svgTemplate;

    // Replace each placeholder with user data
    userData.forEach((value, key) => {
        const placeholder = `{{${key}}}`; // Assuming your SVG uses {{PLACEHOLDER}} syntax
        customizedSvg = customizedSvg.replace(new RegExp(placeholder, 'g'), value);
    });

    return customizedSvg;
}