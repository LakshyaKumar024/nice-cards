import prisma from "@/lib/db-init";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const totalTemplates = await prisma.template.findMany({
            orderBy: { createdAt: "desc" },
            select: { 
                uuid: true, 
                name: true, 
                createdAt: true, 
                catogery: true, 
                price: true, 
                status: true,
                _count: {
                    select: {
                        savedTemplates: true // This counts how many times the template has been saved/used
                    }
                }
            }
        });

        // Transform the data to include usage count in a more accessible way
        const resData = totalTemplates.map(template => ({
            ...template,
            usage: template._count.savedTemplates
        }));

        return new Response(JSON.stringify(resData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            }
        });

    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            }
        })
    }
}