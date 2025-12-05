import prisma from "@/lib/db-init";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest, response: NextResponse) {
    const user = await currentUser();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const saved = await prisma.savedTemplate.findMany({
            where: { userId: user.id },
            select: { templateId: true },
        });

        const templateIds = saved.map(s => s.templateId);

        const templates = await prisma.template.findMany({
            where: { uuid: { in: templateIds }, status: true },
            orderBy: { createdAt: "desc" },
            select: {
                uuid: true,
                name: true,
                description: true,
                catogery: true,
                image: true,
                createdAt: true,
            }
        });

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