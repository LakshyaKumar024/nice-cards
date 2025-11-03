import prisma from "@/lib/db-init";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { designId: string } }
) {
    const { designId } = await params; // This is correct for API routes
    
    // Use the designId
    console.log('Design ID:', designId);

    
    try {
        const templates = await prisma.template.findUnique({
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
            }
        })

        return NextResponse.json(
            {
                success: true,
                data: templates
            }, { status: 200 })

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