import prisma from "@/lib/db-init";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // apply pagination by getting page and limit from query params
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');


    // Get the current user from Clerk
    const { userId } = await auth();

    const templates = await prisma.template.findMany({
      where: {
        status: true
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        uuid: true,
        name: true,
        description: true,
        catogery: true,
        tags: true,
        price: true,
        status: true,
        paid: true,
        svg: true,
        pdf: true,
        image: true,
        createdAt: true,
      }
    })

    // If user is not logged in, return templates with isPurchased: false
    if (!userId) {
      const templatesWithPurchaseStatus = templates.map(template => ({
        ...template,
        isPurchased: false
      }));

      return NextResponse.json(
        {
          success: true,
          data: templatesWithPurchaseStatus
        },
        { status: 200 }
      );
    }

    // If user is logged in, check which templates they've purchased
    const userOrders = await prisma.order.findMany({
      where: {
        userId: userId,
        status: "completed" // Assuming you want to check only completed orders
      },
      select: {
        templateId: true
      }
    });

    // Create a Set of purchased template IDs for faster lookup
    const purchasedTemplateIds = new Set(
      userOrders.map(order => order.templateId)
    );

    // Add isPurchased field to each template
    const templatesWithPurchaseStatus = templates.map(template => ({
      ...template,
      isPurchased: purchasedTemplateIds.has(template.uuid)
    }));

    return NextResponse.json(
      {
        success: true,
        data: templatesWithPurchaseStatus
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}