import prisma from "@/lib/db-init";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {

    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "No user found", message: "signup to make an order." }, { status: 401 });
        }

        const order = await prisma.order.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                razorpayOrderId: true,
                templateId: true,
                amount: true,
                currency: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        })

        return NextResponse.json({
            status: 200,
            message: "Orders fetched successfully",
            ok: true,
            data: order,
            count: order.length
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}