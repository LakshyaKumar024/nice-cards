export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { type, filename } = body;

    if (!type || (type !== "pdf" && type !== "image")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid type specified. Must be 'pdf' or 'image'.",
        },
        { status: 400 }
      );
    }

    const signatureData = generateUploadSignature({
      type,
    });

    console.log("✍️ Generated Cloudinary upload signature:", {
      type,
      filename,
      folder: signatureData.folder,
      publicId: signatureData.publicId,
    });

    return NextResponse.json({
      success: true,
      data: signatureData,
    });
  } catch (error) {
    console.error("❌ Error generating upload signature:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate upload signature",
      },
      { status: 500 }
    );
  }
}

