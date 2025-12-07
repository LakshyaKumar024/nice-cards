import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db-init";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    // Get request body
    const body = await req.json();
    const { userId, overlays } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!overlays) {
      return NextResponse.json(
        { error: "Overlays data is required" },
        { status: 400 }
      );
    }

    // Get user from Clerk to check admin role
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    const isAdmin = user?.publicMetadata?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Get designId from params
    const { designId } = await params;

    // Update the Template's defaultDesign field
    const updatedTemplate = await prisma.template.update({
      where: {
        uuid: designId,
      },
      data: {
        defaultDesign: JSON.stringify(overlays),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Template default design published successfully",
      data: {
        templateId: updatedTemplate.uuid,
        defaultDesign: updatedTemplate.defaultDesign,
      },
    });
  } catch (error) {
    console.error("Error publishing template design:", error);
    
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to publish template design" },
      { status: 500 }
    );
  }
}
