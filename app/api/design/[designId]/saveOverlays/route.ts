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
        console.log(err);

        body = {};
    }
    const { overlays, userId } = body;
    const { designId } = await context.params;


    try {
        const updatedTemplate = await prisma.savedTemplate.updateMany({
            where: {
                userId: userId,
                templateId: designId
            },
            data: {
                content: overlays
            }

        })

        if (!updatedTemplate) {
            return NextResponse.json(
                { success: false, error: "Template not found" },
                { status: 404 }
            );
        }


        return NextResponse.json(
            {
                success: true,
                updated: true,
                data: {
                    overlays: overlays
                },
            },
            { status: 200 }
        );


    } catch (error) {
        console.log(error);
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