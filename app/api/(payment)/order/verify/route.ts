import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db-init";
import nodemailer from "nodemailer";

const generatedSignature = (
    razorpayOrderId: string,
    razorpayPaymentId: string
) => {
    const keySecret = process.env.RAZORPAY_SECRET as string;

    const sig = crypto
        .createHmac("sha256", keySecret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");
    // const expctedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET!).update(body).digest("hex");
    return sig;
};

export async function POST(request: NextRequest) {
    const { orderId, razorpayPaymentId, razorpaySignature } =
        await request.json();
    try {

        const signature = generatedSignature(orderId, razorpayPaymentId);
        if (signature !== razorpaySignature) {
            return NextResponse.json(
                { message: "payment verification failed", isOk: false },
                { status: 400 }
            );
        }

        const order = await prisma.$transaction(async (tx) => {

            const order = await tx.order.update({
                where: {
                    razorpayOrderId: orderId
                }, data: {
                    status: "completed"
                },
                select: {
                    id: true,
                    razorpayOrderId: true,
                    userId: true,
                    templateId: true,
                    status: true,
                }
            })

            const saveTemplate = await tx.savedTemplate.create({
                data: {
                    userId: order?.userId,
                    templateId: order?.templateId,
                }
            })
            return { order, saveTemplate };
        });

        if (order) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST!,
                port: Number(process.env.SMTP_PORT!),
                auth: {
                    user: process.env.SMTP_USERNAME!,
                    pass: process.env.SMTP_PASSWORD!,
                },
            })
            // TODO: MAKE THIS WORK change my email. 
            await transporter.sendMail({
                from: "no-reply@nice-card.com",
                to: "lakshyakumar0098@gmail.com",
                subject: "Order completed",
                text: "Order completed successfully",

            })
        }

        // Probably some database calls here to update order or add premium status to user
        return NextResponse.json(
            { message: "payment verified successfully", isOk: true },
            { status: 200 }
        );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
        console.log(error.message);

        return NextResponse.json({ message: "payment verification failed", isOk: false }, { status: 400 });
    }
}
