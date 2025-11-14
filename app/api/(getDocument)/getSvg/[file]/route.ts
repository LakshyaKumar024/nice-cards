import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> } // 👈 Promise type
) {
  try {
    // ✅ Must await the params Promise
    const resolvedParams = await params;
    const { file } = resolvedParams;

    console.log("File param:", file); // should now print 'design-aaa-21.svg'

    // Security validation
    if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "private", "designs", "design", "svg", file);
    console.log("Resolved path:", filePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": "inline",
        "Content-Security-Policy": "frame-ancestors 'self';",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving SVG:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
