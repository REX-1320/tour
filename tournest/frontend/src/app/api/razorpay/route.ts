import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json();

    if (!amount || !currency) {
      return NextResponse.json({ error: "Missing amount or currency" }, { status: 400 });
    }

    // Creating an order in Razorpay (amount must be in smallest unit e.g., paise)
    const orderOptions = {
      amount: amount * 100, // Converts INR to paise or USD to cents equivalent
      currency: currency || "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(orderOptions);

    if (!order) {
      return NextResponse.json({ error: "Could not create Razorpay order" }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency }, { status: 200 });

  } catch (error: any) {
    console.error("Razorpay Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
