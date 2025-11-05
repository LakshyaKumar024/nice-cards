import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/db-init";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ designId: string }> }
) {
    try {

        // ✅ Await params because it's now a Promise
        const { designId } = await context.params;

        if (!designId) {
            return new NextResponse("Design ID is required", { status: 400 });
        }

        await prisma.template.delete({
            where: {
                uuid: designId
            },
        });

        return new NextResponse("Design deleted successfully", { status: 200 });
    } catch (error) {
        console.error("[DESIGN_DELETE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
