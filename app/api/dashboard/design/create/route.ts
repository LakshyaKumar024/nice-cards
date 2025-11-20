// app/api/dashboard/design/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db-init';
import { CATEGORYS } from '@/prisma/generated/prisma/enums';
import { DesignSchema } from '@/lib/types';
import { parseTags } from '@/lib/helpers';

// Retry configuration
interface RetryConfig {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryableErrors?: string[];
}

class TransactionRetry {
    static async execute<T>(
        operation: () => Promise<T>,
        config: RetryConfig = {}
    ): Promise<T> {
        const {
            maxRetries = 3,
            baseDelay = 1000,
            maxDelay = 10000,
            retryableErrors = ['P2028', 'P2034'] // Transaction timeout and pool connection errors
        } = config;

        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
                
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                lastError = error;

                const isRetryable = retryableErrors.includes(error?.code);

                if (isRetryable && attempt < maxRetries) {
                    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
                    console.warn(`Database operation attempt ${attempt} failed with ${error.code}, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // Not retryable or no more retries
                console.error(`Database operation failed after ${attempt} attempts:`, error);
                throw error;
            }
        }

        throw lastError!;
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

        if (!pdfFileName || !placeholderImageFileName) {
            return NextResponse.json(
                { error: 'pdf and placeholderImage file names are required.' },
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
            svgFileName: svgFileName || "",
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

        // Use retry system for database operation
        const addDesign = await TransactionRetry.execute(async () => {
            return await prisma.template.create({
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
        }, {
            maxRetries: 3,
            baseDelay: 1000,
            retryableErrors: ['P2028'] // Transaction timeout errors
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
                    id: addDesign.uuid
                }
            }
        },
            { status: 201 } // 201 Created - resource successfully created
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error processing request:', error);

        // Handle specific Prisma errors
        if (error.code === 'P2028') {
            return NextResponse.json(
                {
                    error: 'Database timeout - please try again',
                    details: 'The database is currently busy. Please try your request again in a moment.'
                },
                { status: 503 } // 503 Service Unavailable
            );
        }

        // Handle other Prisma errors
        if (error.code && error.code.startsWith('P')) {
            return NextResponse.json(
                {
                    error: 'Database error occurred',
                    details: error.message,
                    code: error.code
                },
                { status: 500 }
            );
        }

        // Generic error response
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}