import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const resolvedParams = await params;
    const { file } = resolvedParams;

    console.log("File param:", file);

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
    const svgContent = fileBuffer.toString("utf-8");

    // Wrap SVG in HTML with CSS link
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${file}</title>
    <link rel="stylesheet" href="/fontsDeclaration/fonts.css">
    <style>
        body {
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
        }
        .svg-container {
            max-width: 100%;
            height: auto;
        }
        svg {
            max-width: 100%;
            height: auto;
            display: block;
        }
    </style>
</head>
<body>
    <div class="svg-container">
        ${svgContent}
    </div>
</body>
</html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "frame-ancestors 'self';",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving SVG:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}