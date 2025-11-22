import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db-init";
import nodemailer from "nodemailer";


export async function POST(request: Request) {
    
    try {
        const body = await request.text();

        const signature = request.headers.get("x-razorpay-signature");

        const expctedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET!).update(body).digest("hex");

        if (signature !== expctedSignature) {
            return NextResponse.json({ error: "Invalid signature", message: "Signature verification failed" }, { status: 401 });
        }

        const event = JSON.parse(body);
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const order = await prisma.order.update({
                where: {
                    razorpayOrderId: payment.order_id
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
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}