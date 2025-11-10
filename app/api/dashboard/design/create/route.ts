import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { success, z } from 'zod';
import prisma from '@/lib/db-init';
import { CATEGORYS } from '@/prisma/generated/prisma/enums';
import { saveFile } from '@/lib/helpers';
import { DesignSchema } from '@/lib/types';


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
        const svgFileName = formData.get('svg') as string;
        const pdfFileName = formData.get('pdf') as string;
        const placeholderImageFileName = formData.get('placeholderImage') as string;

        if (!svgFileName || !pdfFileName || !placeholderImageFileName) {
            return NextResponse.json(
                { error: 'svg, pdf and placeholderImage file names is required.' },
                { status: 500 }
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
            svgFileName,
            pdfFileName,
            placeholderImageFileName // Make sure this is included
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
                    image: placeholderImageFileName,
                    svg: svgFileName,
                    pdf: pdfFileName,
                }
            });

            return addDesign;
        });

        return NextResponse.json({
            success: true,
            message: 'Design uploaded successfully',
            data: {
                files: {
                    svg: `${svgFileName}`,
                    pdf: `${pdfFileName}`,
                    placeholderImage: `${placeholderImageFileName}`,
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

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as "pdf" | "placeholder" | "svg";
    const file = formData.get("file") as File;
    

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "file is required" }, { status: 422 });
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, "-");
    const savedFileName = await saveFile(type, sanitizedFileName, file); // ✅ pass file directly

    return NextResponse.json({ success: true, data: { fileName: savedFileName } }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}

