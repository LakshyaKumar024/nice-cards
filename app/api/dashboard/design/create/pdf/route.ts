// app/api/dashboard/design/create/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log("📄 PDF upload endpoint called");

    // Read the form data ONCE
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error("❌ Failed to parse formData:", formError);
      return NextResponse.json({ 
        error: "Failed to parse form data",
        details: formError instanceof Error ? formError.message : "Unknown error"
      }, { status: 400 });
    }

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("📁 PDF received:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ 
        error: "File must be a PDF" 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9-_.]/g, "-");
    const baseName = sanitizedName.replace(/\.[^/.]+$/, "");
    const fileName = `design-${baseName}-${timestamp}-${random}.pdf`;
    
    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'private', 'designs', 'design', 'pdf');
    
    console.log("📂 Saving to directory:", uploadDir);

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log("✅ Directory ready:", uploadDir);
    } catch (mkdirError) {
      console.error("❌ Failed to create directory:", mkdirError);
      throw new Error(`Directory creation failed: ${mkdirError instanceof Error ? mkdirError.message : 'Unknown error'}`);
    }

    // Convert file to buffer and save
    let bytes;
    try {
      bytes = await file.arrayBuffer();
    } catch (arrayBufferError) {
      console.error("❌ Failed to read file buffer:", arrayBufferError);
      throw new Error(`File read failed: ${arrayBufferError instanceof Error ? arrayBufferError.message : 'Unknown error'}`);
    }

    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);

    console.log("💾 Writing PDF:", filePath);
    console.log("📊 Buffer size:", buffer.length, "bytes");

    try {
      await writeFile(filePath, buffer);
      console.log("✅ PDF saved successfully:", fileName);
    } catch (writeError) {
      console.error("❌ Failed to write file:", writeError);
      throw new Error(`File write failed: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`);
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        fileName: fileName,
        message: "PDF uploaded successfully"
      } 
    }, { status: 201 });

  } catch (error) {
    console.error("❌ PDF upload error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "PDF upload failed" 
    }, { status: 500 });
  }
}