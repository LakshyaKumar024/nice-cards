export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { uploadPdfToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files allowed" },
        { status: 400 }
      );
    }

    console.log("📸 Uploading PDF to Cloudinary:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const pdfUrl = await uploadPdfToCloudinary(file);

    return NextResponse.json({
      success: true,
      data: {
        fileName: pdfUrl,
        url: pdfUrl,
        message: "PDF uploaded successfully to Cloudinary",
      },
    });
  } catch (err) {
    console.error("❌ PDF upload error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "PDF upload failed",
      },
      { status: 500 }
    );
  }
}
