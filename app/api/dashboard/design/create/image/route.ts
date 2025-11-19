// app/api/dashboard/design/create/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log("🖼️ Image upload endpoint called");

    // Read the form data ONCE
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("📁 File received:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: "File must be an image" 
      }, { status: 400 });
    }

    console.log("☁️ Uploading to Cloudinary...");

    // Upload to Cloudinary and get the URL directly
    const imageUrl = await uploadImageToCloudinary(file);

    console.log("✅ Image uploaded to Cloudinary:", imageUrl);

    return NextResponse.json({ 
      success: true, 
      data: { 
        fileName: imageUrl, // Now returns the Cloudinary URL
        url: imageUrl, // Also include url field for clarity
        message: "Image uploaded successfully to Cloudinary"
      } 
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Image upload error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Image upload failed" 
    }, { status: 500 });
  }
}