import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import prisma from '@/lib/db-init';
import { CATEGORYS } from '@/prisma/generated/prisma/enums';

// Define Zod schemas
const DesignSchema = z.object({
    name: z.string().min(3, "Correct Design name is required").max(100, "Design name too long"),
    description: z.string().max(500, "Description too long").optional().default(""),
    catogary: z.string().min(1, "Category is required").max(500, "Category too long"), // Changed from optional to required
    tags: z.array(z.string().min(1, "Tag cannot be empty")).default([]),
    price: z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num)) throw new Error("Price must be a valid number");
        return num;
    }).pipe(
        z.number().min(0, "Price cannot be negative")
    ),
    paid: z.boolean().default(false),
    svgFile: z.instanceof(File).refine(
        (file) => file.type === 'image/svg+xml',
        "File must be an SVG"
    ),
    placeholderImageFile: z.instanceof(File).refine(
        (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
        "File must be a JPG, PNG, or JPEG image"
    ),
    pdfFile: z.instanceof(File).refine(
        (file) => file.type === 'application/pdf',
        "File must be a PDF"
    )
});


// Helper function to get file extension from MIME type
function getImageExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'application/pdf': 'pdf'
    };
    return extensions[mimeType] || 'bin';
}


// Helper function to parse tags safely
function parseTags(tagsString: string | null): string[] {
    if (!tagsString) return [];

    try {
        // Handle both JSON array and comma-separated values
        if (tagsString.startsWith('[') && tagsString.endsWith(']')) {
            return JSON.parse(tagsString);
        } else if (tagsString.startsWith('tags : [')) {
            const jsonMatch = tagsString.match(/\[.*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } else {
            // Comma-separated fallback
            return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
    } catch (error) {
        console.error('Error parsing tags:', error);
        return [];
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Extract and validate form data
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const catogary = formData.get('category') as string;
        const tagsString = formData.get('tags') as string;
        const price = formData.get('price') as string;
        const paidString = formData.get("paid") as string;
        const svgFile = formData.get('svg') as File;
        const pdfFile = formData.get('pdf') as File;
        const placeholderImageFile = formData.get('placeholderImage') as File;

        // Check if required files are present and valid
        if (!svgFile || svgFile.size === 0) {
            return NextResponse.json(
                { error: 'SVG file is required' },
                { status: 422 }
            );
        }
        if (!pdfFile || pdfFile.size === 0) {
            return NextResponse.json(
                { error: 'PDF file is required' },
                { status: 422 }
            );
        }
        if (!placeholderImageFile || placeholderImageFile.size === 0) {
            return NextResponse.json(
                { error: 'Placeholder image file is required' },
                { status: 422 }
            );
        }

        // Validate category exists
        if (!catogary || catogary.trim() === '') {
            return NextResponse.json(
                { error: 'Category is required' },
                { status: 422 }
            );
        }

        // Parse tags safely
        const tags = parseTags(tagsString);

        // Parse paid boolean
        const paid = paidString === "true" || paidString === "1" || paidString === "on";

        // Prepare data for validation
        const formDataToValidate = {
            name,
            description: description || "",
            catogary: catogary || "", // Ensure it's never null
            tags,
            price: price || "0",
            paid,
            svgFile,
            pdfFile,
            placeholderImageFile // Make sure this is included
        };

        // Validate with Zod
        const validationResult = DesignSchema.safeParse(formDataToValidate);

        if (!validationResult.success) {
            const errorDetails: Record<string, string> = {};

            validationResult.error.issues.forEach((err) => {
                const field = err.path.join('.');
                errorDetails[field] = err.message;
            });

            return NextResponse.json(
                {
                    error: 'Validation failed',
                    data: errorDetails
                },
                { status: 422 } // 422 Unprocessable Entity - validation errors
            );
        }

        const validatedData = validationResult.data;

        // Create directories if they don't exist
        const pdfDir = path.join(process.cwd(), 'private', 'designs', 'design', 'pdf');
        const svgDir = path.join(process.cwd(), 'private', 'designs', 'design', 'svg');
        const placeholderImageDir = path.join(process.cwd(), 'public', 'placeholder', 'image');

        try {
            await mkdir(pdfDir, { recursive: true });
            await mkdir(svgDir, { recursive: true });
            await mkdir(placeholderImageDir, { recursive: true });
        } catch (error) {
            console.error('Error creating directories:', error);
            return NextResponse.json(
                {
                    error: 'Server configuration error',
                    details: 'Failed to create storage directories'
                },
                { status: 500 } // 500 Internal Server Error
            );
        }


        // Sanitize filename
        const sanitizedName = validatedData.name.replace(/[^a-zA-Z0-9-_]/g, '-');

        // Generate unique filenames
        const datetime = new Date().getHours()
        const svgFilename = `design-${sanitizedName}-${datetime}.svg`;
        const pdfFilename = `design-${sanitizedName}-${datetime}.pdf`;
        const placeholderImageFilename = `design-${sanitizedName}-${datetime}.${getImageExtension(placeholderImageFile.type)}`;

        try {
            // Convert files to buffers
            const placeholderImageBuffer = Buffer.from(await validatedData.placeholderImageFile.arrayBuffer());
            const svgBuffer = Buffer.from(await validatedData.svgFile.arrayBuffer());
            const pdfBuffer = Buffer.from(await validatedData.pdfFile.arrayBuffer());


            const addingDesign = await prisma.$transaction(async (tx) => {
                // Create DB entry first
                const addDesign = await tx.template.create({
                    data: {
                        name: validatedData.name,
                        description: validatedData.description,
                        price: validatedData.price,
                        paid: validatedData.paid,
                        catogery: validatedData.catogary as CATEGORYS,
                        tags: JSON.stringify(validatedData.tags),
                        image: placeholderImageFilename,
                        svg: svgFilename,
                        pdf: pdfFilename,
                    }
                });

                // Save files only after successful DB entry
                const svgPath = path.join(svgDir, svgFilename);
                const pdfPath = path.join(pdfDir, pdfFilename);
                const placeholderImagePath = path.join(placeholderImageDir, placeholderImageFilename);

                await writeFile(svgPath, svgBuffer);
                await writeFile(pdfPath, pdfBuffer);
                await writeFile(placeholderImagePath, placeholderImageBuffer);

                // Update status to completed
                return addDesign;
            });

            return NextResponse.json({
            success: true,
            message: 'Design uploaded successfully',
            data: {
                files: {
                    svg: `/${svgFilename}`,
                    pdf: `/${pdfFilename}`,
                },
                design: {
                    name: validatedData.name,
                    description: validatedData.description,
                    price: validatedData.price,
                    paid: validatedData.paid,
                    tags: validatedData.tags,
                    id: addingDesign.uuid
                }
            }
        },
            { status: 201 } // 201 Created - resource successfully created
        );

        } catch (error) {
            console.error('Error saving files:', error);
            return NextResponse.json(
                {
                    error: 'Failed to save files',
                    details: 'Storage error occurred'
                },
                { status: 507 } // 507 Insufficient Storage
            );
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 } // 500 Internal Server Error
        );
    }
}