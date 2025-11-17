import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db-init";
import nodemailer from "nodemailer";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs"; // Required for nodemailer to work

type Body = {
    orderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
};

const generateSignature = (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    secret: string
) =>
    crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

export async function POST(request: NextRequest) {
    const body = (await request.json()) as Body;

    const { orderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(
            { message: "Missing required fields", isOk: false },
            { status: 400 }
        );
    }

    const {
        RAZORPAY_SECRET,
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USERNAME,
        SMTP_PASSWORD,
        FROM_MAIL,
        NEXT_PUBLIC_BASE_URL,
        SITE_NAME
    } = process.env;

    if (!RAZORPAY_SECRET) {
        console.error("Missing RAZORPAY_SECRET");
        return NextResponse.json(
            { message: "Server configuration error", isOk: false },
            { status: 500 }
        );
    }

    try {
        // Verify signature
        const expected = generateSignature(
            orderId,
            razorpayPaymentId,
            RAZORPAY_SECRET
        );

        if (expected !== razorpaySignature) {
            return NextResponse.json(
                {
                    message: "Payment verification failed (invalid signature)",
                    isOk: false,
                },
                { status: 400 }
            );
        }

        // Transaction: update order + save template
        const transactionResult = await prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { razorpayOrderId: orderId },
                data: { status: "completed" },
                select: {
                    id: true,
                    razorpayOrderId: true,
                    userId: true,
                    templateId: true,
                    status: true,
                },
            });

            const savedTemplate = await tx.savedTemplate.create({
                data: {
                    userId: updatedOrder.userId,
                    templateId: updatedOrder.templateId,
                },
            });

            return { updatedOrder, savedTemplate };
        });

        const clerk = await clerkClient();
        const user = await clerk.users.getUser(transactionResult.updatedOrder.userId);
        const templateLink = `${NEXT_PUBLIC_BASE_URL}/design/${transactionResult.updatedOrder.templateId}`;

        // --------------------------
        // EMAIL SENDING WITH LOGS
        // --------------------------
        if (SMTP_HOST && SMTP_PORT && SMTP_USERNAME && SMTP_PASSWORD && FROM_MAIL) {
            const portNum = Number(SMTP_PORT);
            const transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: Number.isFinite(portNum) ? portNum : 587,
                secure: Number(portNum) === 465,
                auth: {
                    user: SMTP_USERNAME,
                    pass: SMTP_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            try {
                console.log("📧 [EMAIL] Preparing to send email…");
                console.log("📧 [EMAIL] SMTP Host:", SMTP_HOST);
                console.log("📧 [EMAIL] SMTP Port:", portNum);
                console.log("📧 [EMAIL] SMTP Username:", SMTP_USERNAME);
                console.log("📧 [EMAIL] FROM:", FROM_MAIL);

                const mailOptions = {
                    from: FROM_MAIL,
                    to: user.primaryEmailAddress.emailAddress,
                    subject: `${SITE_NAME} – Your Template Is Ready! 🎉`,
                    text: `
Hi ${user.firstName || ""},

Your card template has been successfully purchased!

Order ID: ${transactionResult.updatedOrder.razorpayOrderId}

You can start editing your template here:
${templateLink}

Thank you for choosing Nice Card!
`.trim(),

                    html: `
<div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 2px 10px rgba(0,0,0,0.08);">

    <h2 style="color:#333; margin-top:0;">🎉 Thank you for your purchase!</h2>

    <p style="font-size:16px; color:#555;">
      Hi <strong>${user.firstName || ""}</strong>,<br><br>
      Your card template has been 
      <strong style="color:#2b7cff;">successfully purchased</strong> on <strong>${SITE_NAME}</strong>.
    </p>

    <div style="background:#f0f4ff; padding:16px; border-radius:8px; margin:20px 0;">
      <p style="margin:0; font-size:16px; color:#2b7cff;">
        <strong>Order ID:</strong> ${transactionResult.updatedOrder.razorpayOrderId}
      </p>
    </div>

    <p style="font-size:16px; color:#444;">
      You can start editing your template right away by clicking the button below:
    </p>

    <a href="${templateLink}" 
       style="display:inline-block; background:#2b7cff; color:#fff; padding:12px 20px; 
              border-radius:6px; font-size:16px; text-decoration:none; margin-top:10px;">
      Open Template
    </a>

    <p style="font-size:14px; color:#888; margin-top:30px;">
      or copy the link manually:<br>
      <a href="${templateLink}" style="color:#2b7cff;">${templateLink}</a>
    </p>

    <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">

    <p style="font-size:14px; color:#777;">
      Thank you for choosing <strong>${SITE_NAME}</strong>.<br>
      We hope you enjoy designing your card!
    </p>

  </div>
</div>
  `,
                };

                const info = await transporter.sendMail(mailOptions);
                console.log("📧 [EMAIL] Successfully sent!");
                console.log("📧 [EMAIL] MessageId:", info.messageId);
                console.log("📧 [EMAIL] Response:", info.response);
                console.log("📧 [EMAIL] Accepted:", info.accepted);
                console.log("📧 [EMAIL] Rejected:", info.rejected);
            } catch (err) {
                console.error("❌ [EMAIL] Failed to send email:", err);
            }
        } else {
            console.log(SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, FROM_MAIL);

            console.warn("⚠️ [EMAIL] SMTP not fully configured — skipping email sending.");
        }

        return NextResponse.json(
            {
                message: "Payment verified successfully",
                isOk: true,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("❌ Error in Razorpay verification:", error?.message ?? error);

        return NextResponse.json(
            { message: "Internal server error", isOk: false },
            { status: 500 }
        );
    }
}
