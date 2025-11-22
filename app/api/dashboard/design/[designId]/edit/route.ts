import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db-init";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ designId: string }> }
) {
    try {

        // ✅ Await params because it's now a Promise
        const { designId } = await context.params;

        if (!designId) {
            return new NextResponse("Design ID is required", { status: 400 });
        }

        const body = await req.json();
        const { name, catogery, description, paid, status, price } = body;

        await prisma.template.update({
            where: {
                uuid: designId
            }, data: {
                name,
                catogery,
                description,
                paid,
                status,
                price
            }, select: {
                uuid: true,
                name: true,
                catogery: true,
                description: true,
                paid: true,
                status: true,
                createdAt: true,
            }
        })

        return new NextResponse("template updated successfully", { status: 200 });
    } catch (error) {
        console.error("[DESIGN_UPDATE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
