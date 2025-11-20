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
    let fileName: string;
    if (!file) {
      return NextResponse.json({ error: "File parameter is required" }, { status: 400 });
    }

    try {
      const fileData = await prisma.template.findFirst({
        where: {
          pdf: file,
        },
        select: {
          pdf: true,
        },
      });
      fileName = fileData.pdf as string;
    } catch (error) {
      console.log("fileData Error: ", error);

      fileName = file;
    }

    if (!resolvedParams?.file) {
      return NextResponse.json({ error: "File parameter is required" }, { status: 400 });
    }

    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const filePath = path.join(
      process.cwd(),
      "private/designs/design/pdf/",
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // ✅ Fixed: Remove overly restrictive headers that block Chrome
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "X-Frame-Options": "SAMEORIGIN", // Allow embedding in same origin
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}