import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db-init";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import path from "path";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ designId: string }> }
) {
    try {
        const { designId } = await context.params;

        if (!designId) {
            return new NextResponse("Design ID is required", { status: 400 });
        }

        // 1. Fetch template data to locate assets for removal
        const template = await prisma.template.findUnique({
            where: { uuid: designId },
            select: { pdf: true, image: true },
        });

        if (template) {
            // Delete PDF from Cloudinary or local disk
            if (template.pdf) {
                if (template.pdf.includes("cloudinary.com")) {
                    await deleteFromCloudinary(template.pdf, "image");
                } else {
                    try {
                        const localFs = eval("require('fs')");
                        const localDir = ["private", "designs", "design", "pdf"].reduce((a, b) => a + "/" + b);
                        const localPath = path.resolve(localDir, path.basename(template.pdf));
                        if (localFs.existsSync(localPath)) {
                            await localFs.promises.unlink(localPath).catch(() => {});
                        }
                    } catch {}
                }
            }

            // Delete Image(s) from Cloudinary
            if (template.image) {
                try {
                    let imageList: string[] = [];
                    if (template.image.startsWith("[")) {
                        imageList = JSON.parse(template.image);
                    } else {
                        imageList = [template.image];
                    }
                    for (const imgUrl of imageList) {
                        if (imgUrl.includes("cloudinary.com")) {
                            await deleteFromCloudinary(imgUrl, "image");
                        }
                    }
                } catch (imgErr) {
                    console.error("Error deleting template images from Cloudinary:", imgErr);
                }
            }
        }

        // 2. Delete database record
        await prisma.template.delete({
            where: {
                uuid: designId,
            },
        });

        return NextResponse.json(
            { success: true, message: "Design and associated assets deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("[DESIGN_DELETE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
