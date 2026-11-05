export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files allowed" },
        { status: 400 }
      );
    }

    console.log("📸 Uploading image to Cloudinary:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const imageUrl = await uploadImageToCloudinary(file);

    return NextResponse.json({
      success: true,
      data: {
        fileName: imageUrl,
        url: imageUrl,
        message: "Image uploaded successfully",
      },
    });
  } catch (err) {
    console.error("❌ Image upload error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Image upload failed",
      },
      { status: 500 }
    );
  }
}

