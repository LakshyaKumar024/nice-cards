import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db-init";
import { uuidv4 } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";


export async function POST(request: NextRequest) {

  try {
    const { userId, templateId } = await request.json();
    const client = await clerkClient()

    if (!userId || !templateId) {
      return NextResponse.json(
        { success: false, message: "Missing userId or templateId" },
        { status: 400 }
      );
    }

    // Fetch template info
    const template = await prisma.template.findUnique({
      where: { uuid: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    // Check if it's actually free
    if (Number(template.price) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This template is not free. Please use payment checkout.",
        },
        { status: 400 }
      );
    }

    // Check if already saved to avoid duplicates
    const alreadySaved = await prisma.savedTemplate.findFirst({
      where: { userId, templateId },
    });

    if (alreadySaved) {
      return NextResponse.json(
        { success: true, message: "Template already saved.", alreadySaved: true },
        { status: 200 }
      );
    }


    const order = await prisma.$transaction(async (tx) => {
      const razorpayOrderId = `free-${Date.now()}-${uuidv4()}`;

      const order = await tx.order.create({
        data: {
          userId: userId,
          templateId: templateId,
          razorpayOrderId: razorpayOrderId,
          amount: 0,
          status: "completed",
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
          userId: userId,
          templateId: templateId,
        }
      })
      return { order, saveTemplate };
    });



    if (order) {

      const user = await client.users.getUser(order.order.userId)

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
        to: `${user.primaryEmailAddress.emailAddress}`,
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

    }

    return NextResponse.json(
      {
        success: true,
        message: "Free template added successfully.",
      },
      { status: 200 }
    );



  } catch (error) {
    console.error("Error saving free template:", error);
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
