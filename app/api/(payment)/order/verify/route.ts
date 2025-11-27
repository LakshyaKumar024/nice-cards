import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db-init";
import nodemailer from "nodemailer";
import { clerkClient } from '@clerk/nextjs/server'


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
    const client = await clerkClient()

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
            try {
                const user = await client.users.getUser(order.order.userId)
                console.log(user);

                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST ?? "smtp-relay.brevo.com",
                    port: Number(process.env.SMTP_PORT!),
                    secure: false, // Brevo uses STARTTLS on port 587
                    auth: {
                        user: process.env.SMTP_USERNAME!,
                        pass: process.env.SMTP_PASSWORD!,
                    },
                })

                // TODO: MAKE THIS WORK change my email. 
                await transporter.sendMail({
                    from: `"Nice Card" <no-reply@nicecards.shop>`,
                    to: `${user.primaryEmailAddress?.emailAddress}`,
                    subject: "🎉 Your Order is Complete!",
                    attachments: [
                        {
                            filename: "logo.jpg",
                            path: "./public/logo.jpg",   // Path inside your Next.js project
                            cid: "nicecardlogo",         // Same CID used inside HTML
                        }
                    ],
                    html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
        
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:nicecardlogo" alt="Nice Card" style="width: 140px; border-radius: 8px;" />
        </div>
        
        <h2 style="color: #333; text-align: center;">🎉 Order Completed Successfully!</h2>
        
        <p style="font-size: 15px; color: #555;">
        Hello,
        <br/><br/>
        Thank you for your purchase on <strong>Nice Card</strong>.
        </p>
        
        <!-- Button -->
        <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/edit/${order.saveTemplate.templateId}"
        style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; font-size: 16px; border-radius: 8px; display: inline-block;">
        ➜ Edit Your Template
        </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
        If the button above does not work, copy and paste this link:
        <br/>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/edit/${order.order.templateId}" style="color: #4f46e5;">
        ${process.env.NEXT_PUBLIC_BASE_URL}/edit/${order.order.templateId}
        </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
        This is an automated email from Nice Card.
        </p>
        
        </div>
        </div>
        `
                });
            } catch (err) {
                console.log("email error:", err)
            }

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
