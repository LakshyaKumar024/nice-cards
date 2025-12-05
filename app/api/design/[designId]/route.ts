import prisma from "@/lib/db-init";
import { NextRequest, NextResponse } from "next/server";


interface BodyType {
    userId?: string;
}


export async function POST(
    request: NextRequest,
    context: { params: Promise<{ designId: string }> }
) {
    let body = {};
    try {
        const text = await request.text();
        body = text ? JSON.parse(text) : {};
    } catch {
        body = {};
    }

    const userId = (body as BodyType).userId;

    const { designId } = await context.params;


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
                        where: { userId: userId, templateId: designId },
                        select: {
                            uuid: true,
                            content: true,
                            createdAt: true,
                        },
                    }
                    : undefined,
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
                    savedTemplate: savedTemplates[0] || null,
                    hasPurchased,
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