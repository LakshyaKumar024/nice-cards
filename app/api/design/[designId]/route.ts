import prisma from "@/lib/db-init";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
    request: NextRequest,
    context: { params: Promise<{ designId: string }> }
) {
    let body;
    try {
        body = await request.json();
    } catch (err) {
        body = {};
    }
    const { userId } = body;
    const { designId } = await context.params;

    // Use the designId
    console.log('user ID:', userId);

    try {
        const template = await prisma.template.findUnique({
            where: { uuid: designId },
            select: {
                uuid: true,
                name: true,
                description: true,
                catogery: true,
                tags: true,
                price: true,
                paid: true,
                svg: true,
                pdf: true,
                image: true,
                createdAt: true,
                savedTemplates: userId
                    ? {
                        where: { userId },
                        select: {
                            uuid: true,
                            file_location: true,
                            createdAt: true,
                        },
                    }
                    : {}
            }
        })

        if (!template) {
            return NextResponse.json(
                { success: false, error: "Template not found" },
                { status: 404 }
            );
        }


        const savedTemplates = userId ? template.savedTemplates || [] : [];
        const hasPurchased = savedTemplates.length > 0;
        return NextResponse.json(
            {
                success: true,
                data: {
                    ...template,
                    hasPurchased,
                },
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