import prisma from "@/lib/db-init";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {

    try {

        const clerk = await clerkClient();
        const users = await clerk.users.getUserList();

        const totalMembers = await clerk.users.getCount();

        // Calculate new users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsersCount = users.data.filter(user => {
            const createdAt = new Date(user.createdAt);
            return createdAt > thirtyDaysAgo;
        }).length;

        const totalTemplates = await prisma.template.count()

        const getTotalRevenue = await prisma.order.findMany({
            where: {
                status: "completed",
                createdAt: {
                    gte: thirtyDaysAgo,
                    lt: new Date(),
                }
            },
            select: {
                amount: true,
            }
        })
        const totlaRevenue = getTotalRevenue.reduce((acc, order) => {
            return acc + order.amount;
        }, 0);


        const resData = {
            totalMembers: totalMembers,
            totalTemplates: totalTemplates,
            newUsers: newUsersCount,
            totlaRevenue: (totlaRevenue / 100),
        }

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
