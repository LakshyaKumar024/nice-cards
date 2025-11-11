import { getTemporaryLink } from '@/lib/file-storage';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ downloadId: string }> }
) {
  try {
    const { downloadId } = await params;
    
    console.log('📥 Download requested for:', downloadId);

    // Check if download link exists and is not expired
    const downloadData = await getTemporaryLink(downloadId);
    console.log("📦 Download data:", downloadData ? "FOUND" : "NOT FOUND");
    
    if (!downloadData) {
      return NextResponse.json(
        { error: 'Download link not found or expired' },
        { status: 404 }
      );
    }

    // Return the SVG file with proper headers
    return new NextResponse(downloadData.svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${downloadData.filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('❌ Download endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}