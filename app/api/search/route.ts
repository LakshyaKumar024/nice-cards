import prisma from "@/lib/db-init";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        // Get the current user from Clerk
        const { userId } = await auth();
        const { query } = await request.json();

        // Validate that query exists
        if (!query || typeof query !== 'string') {
            return NextResponse.json(
                {
                    error: 'Query parameter is required',
                    success: false,
                },
                { status: 400 }
            );
        }

        const templates = await prisma.template.findMany({
            where: {
                status: true, // Only active templates
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive', // Case insensitive search
                        },
                    },
                    {
                        description: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        tags: {
                            contains: query,
                        },
                    },
                ],
            },
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
                defaultDesign: true,
                pdf: true,
                image: true,
                createdAt: true,
            }
        });

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