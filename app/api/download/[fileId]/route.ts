import { getTemporaryFile, isPdfReady } from '@/lib/file-storage';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  console.log("WPPPP");
  
  try {
    const { fileId } = await params;
    
    console.log('📥 Download requested for:', fileId);
    
    // Check if file exists and is not expired
    const fileData = await getTemporaryFile(fileId);
    console.log("📦 File data:", fileData ? "FOUND" : "NOT FOUND");
    
    if (!fileData) {
      return NextResponse.json(
        { error: 'PDF file not found or expired' },
        { status: 404 }
      );
    }

    // Verify it's a PDF file
    if (!fileData.filename.endsWith('.pdf')) {
      console.log('⚠️ Filename does not end with .pdf:', fileData.filename);
      // Force PDF extension
      fileData.filename = fileData.filename.replace('.svg', '.pdf');
    }

    // Read the PDF file from disk
    const fileBuffer = await fs.promises.readFile(fileData.filePath);

    // Return the PDF file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileData.filename}"`,
        'Content-Length': fileBuffer.length.toString(),
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