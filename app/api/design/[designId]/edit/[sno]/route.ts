import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db-init';
import { storeTemporarySvg, generatePdfFromSvgUrl, cleanupExpiredFiles } from '@/lib/file-storage';
import { customizeSvg } from '@/lib/svg-helpers';
import { toast } from 'sonner';

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

        // 4. Generate temporary file ID
        const fileId = `${designId}-${sno}-${Date.now()}`;

        // 5. Save SVG to public/tmp folder and get public URL
        const svgUrl = await storeTemporarySvg(fileId, customizedSvg);
        
        if (!svgUrl) {
            return NextResponse.json(
                { error: 'Failed to save SVG file' },
                { status: 500 }
            );
        }

        console.log('🔗 SVG public URL:', svgUrl);

        // 6. Convert SVG URL to PDF using Puppeteer
        console.log('🔄 Converting SVG URL to PDF...');
        const pdfGenerated = await generatePdfFromSvgUrl(
            fileId, 
            svgUrl, 
            `custom-design-${designId}-${sno}.pdf`
        );

        if (!pdfGenerated) {
            return NextResponse.json(
                { error: 'Failed to convert SVG to PDF' },
                { status: 500 }
            );
        }

        // 7. Generate download URL for PDF
        const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/download/${fileId}`;

        console.log('🔗 Generated download info:', {
            fileId,
            downloadUrl,
            filename: `custom-design-${designId}-${sno}.pdf`
        });

        // 8. Clean up expired files
        await cleanupExpiredFiles();

        return NextResponse.json({
            success: true,
            downloadUrl: downloadUrl,
            fileId: fileId,
            message: 'Design customized and converted to PDF successfully. Your download will start automatically.',
            expiresIn: '24 hours',
            fileType: 'pdf'
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
    try {
        console.log(designId);

        const template = await prisma.template.findFirst({
            where: { uuid: designId },
            select: {
                svg: true,
            }
        });
        if (!template) {
            console.error('Error fetching SVG filename:');
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
        const filePath = path.join(process.cwd(), 'private', 'designs', 'design', 'svg', filename);
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading SVG file:', error);
        return null;
    }
}