import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db-init";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const resolvedParams = await params;
    const { file } = resolvedParams;

    if (!file) {
      return NextResponse.json({ error: "File parameter is required" }, { status: 400 });
    }

    let pdfTarget = file;

    try {
      const fileData = await prisma.template.findFirst({
        where: {
          OR: [
            { pdf: file },
            { pdf: { contains: file } },
            { uuid: file },
          ],
        },
        select: {
          pdf: true,
        },
      });

      if (fileData?.pdf) {
        pdfTarget = fileData.pdf;
      }
    } catch (error) {
      console.log("fileData Error:", error);
    }

    // 1. If stored in Cloudinary, fetch and stream the PDF
    if (
      pdfTarget.startsWith("http://") ||
      pdfTarget.startsWith("https://") ||
      pdfTarget.includes("cloudinary.com")
    ) {
      const cloudRes = await fetch(pdfTarget);
      if (!cloudRes.ok) {
        console.error("Cloudinary PDF fetch failed with status:", cloudRes.status);
        return NextResponse.json(
          { error: "Failed to fetch PDF from cloud storage" },
          { status: cloudRes.status }
        );
      }

      const cloudArrayBuffer = await cloudRes.arrayBuffer();
      const fileBuffer = Buffer.from(cloudArrayBuffer);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "X-Frame-Options": "SAMEORIGIN",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // 2. If stored locally (backwards compatibility)
    if (pdfTarget.includes("..")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const cleanFileName = path.basename(pdfTarget);
    const filePath = path.join(
      process.cwd(),
      "private/designs/design/pdf/",
      cleanFileName
    );

    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "X-Frame-Options": "SAMEORIGIN",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
