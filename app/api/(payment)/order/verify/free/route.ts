import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db-init";
import { v1 as uuidv1 } from "uuid";
import nodemailer from "nodemailer";
import { clerkClient } from '@clerk/nextjs/server';


export const runtime = "nodejs"; // Nodemailer requires Node.js runtime

export async function POST(request: NextRequest) {
  try {
    const uuid = uuidv1();
    const { userId, templateId } = await request.json();
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId);



    if (!userId || !templateId) {
      return NextResponse.json(
        { success: false, message: "Missing userId or templateId" },
        { status: 400 }
      );
    }

    // Fetch template
    const template = await prisma.template.findUnique({
      where: { uuid: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    // Ensure template is actually free
    if (Number(template.price) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This template is not free. Please use payment checkout.",
        },
        { status: 400 }
      );
    }

    // Prevent duplicates
    const alreadySaved = await prisma.savedTemplate.findFirst({
      where: { userId, templateId },
    });

    if (alreadySaved) {
      return NextResponse.json(
        {
          success: true,
          message: "Template already saved.",
          alreadySaved: true,
        },
        { status: 200 }
      );
    }

    // Create free order + saved template inside a transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          templateId,
          razorpayOrderId: `free_odr-${uuid}`,
          amount: 0,
          status: "completed",
        },
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
          userId,
          templateId,
        },
      });

      return { order, savedTemplate };
    });

    // ----------
    // EMAIL SEND
    // ----------
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USERNAME,
      SMTP_PASSWORD,
      FROM_MAIL,
      NEXT_PUBLIC_BASE_URL,
      SITE_NAME
    } = process.env;

    console.log("👉 Checking SMTP environment variables...");
    console.log("SMTP_HOST:", SMTP_HOST);
    console.log("SMTP_PORT:", SMTP_PORT);
    console.log("SMTP_USERNAME:", SMTP_USERNAME);
    console.log("SMTP_PASSWORD:", SMTP_PASSWORD ? "SET" : "MISSING");
    console.log("FROM_MAIL:", FROM_MAIL);

    const templateLink = `${NEXT_PUBLIC_BASE_URL}/design/${transactionResult.order.templateId}`;

    if (SMTP_HOST && SMTP_PORT && SMTP_USERNAME && SMTP_PASSWORD && FROM_MAIL) {
      const portNum = Number(SMTP_PORT);



      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number.isFinite(portNum) ? portNum : 587,
        secure: portNum === 465,
        auth: {
          user: SMTP_USERNAME,
          pass: SMTP_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });

      try {
        console.log("📧 [EMAIL] Preparing to send email...");
        console.log("📧 [EMAIL] Mail To: " + (await user).primaryEmailAddress.emailAddress);

        const mailOptions = {
          from: FROM_MAIL,
          to: user.primaryEmailAddress.emailAddress,
          subject: `${SITE_NAME} – Your Template Is Ready! 🎉`,
          text: `
Hi ${user.firstName || ""},

Your card template has been successfully purchased!

Order ID: ${transactionResult.order.razorpayOrderId}

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
        <strong>Order ID:</strong> ${transactionResult.order.razorpayOrderId}
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

        console.log("📧 [EMAIL] Mail Options:", mailOptions);

        const info = await transporter.sendMail(mailOptions);

        console.log("📧 [EMAIL] Email Sent!");
        console.log("📧 Message ID:", info.messageId);
        console.log("📧 SMTP Response:", info.response);
      } catch (emailError) {
        console.error("❌ [EMAIL] Failed to send email:", emailError);
      }
    } else {
      console.warn("⚠️ [EMAIL] SMTP not fully configured — skipping email sending.");
    }

    // ----------
    // SUCCESS RESPONSE
    // ----------
    return NextResponse.json(
      {
        success: true,
        message: "Free template added successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error saving free template:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
