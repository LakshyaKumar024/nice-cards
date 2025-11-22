import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/db-init";


export async function POST(request: Request) {
  const { userId } = await auth();
  const { productId } = await request.json();

  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    throw new Error("Razorpay ENV vars missing at runtime");
  }


  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  if (!userId) {
    return NextResponse.json({ error: "No user found", message: "signup to make an order." }, { status: 401 });
  }

  try {
    const getTemplate = await prisma.template.findUnique({ where: { uuid: productId } })

    if (!getTemplate) {
      return NextResponse.json({ error: "No template found", message: "give an valid product id" }, { status: 401 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(getTemplate.price) * 100),
      currency: "INR",
      receipt: `receipt-${new Date().getDate()}`,
      notes: {
        "product_id": getTemplate.uuid
      }
    });

    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
        templateId: productId,
        razorpayOrderId: order.id,
        amount: Number(order.amount),
        status: "pending",
      }
    })

    return NextResponse.json({
      status: 200,
      message: "Order created successfully",
      ok: true,
      data: {
        dbOrderId: newOrder.id,
        orderId: newOrder.id,
        amount: newOrder.amount,
        currency: newOrder.currency,
        template: getTemplate,
        razorpay: order
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}