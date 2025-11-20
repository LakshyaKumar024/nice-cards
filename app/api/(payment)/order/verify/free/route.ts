import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db-init";
import { uuidv4 } from "zod";


export async function POST(request: NextRequest) {
  try {
    const { userId, templateId } = await request.json();

    if (!userId || !templateId) {
      return NextResponse.json(
        { success: false, message: "Missing userId or templateId" },
        { status: 400 }
      );
    }

    // Fetch template info
    const template = await prisma.template.findUnique({
      where: { uuid: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    // Check if it's actually free
    if (Number(template.price) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This template is not free. Please use payment checkout.",
        },
        { status: 400 }
      );
    }

    // Check if already saved to avoid duplicates
    const alreadySaved = await prisma.savedTemplate.findFirst({
      where: { userId, templateId },
    });

    if (alreadySaved) {
      return NextResponse.json(
        { success: true, message: "Template already saved.", alreadySaved: true },
        { status: 200 }
      );
    }


    await prisma.$transaction(async (tx) => {
        const razorpayOrderId = `free-${Date.now()}-${uuidv4()}`;

      const order = await tx.order.create({
        data: {
          userId: userId,
          templateId: templateId,
          razorpayOrderId: razorpayOrderId,
          amount: 0,
          status: "completed",
        },
        select: {
          id: true,
          razorpayOrderId: true,
          userId: true,
          templateId: true,
          status: true,
        }
      })

      const saveTemplate = await tx.savedTemplate.create({
        data: {
          userId: userId,
          templateId: templateId,
        }
      })
      return { order, saveTemplate };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Free template added successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving free template:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
