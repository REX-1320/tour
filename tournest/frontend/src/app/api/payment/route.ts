import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import crypto from 'crypto';

// POST /api/payment  — Create a Razorpay order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', destinationId, destinationTitle, bookingId, userId } = body;

    if (!amount || !destinationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Amount must be in paise (smallest currency unit)
    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        destinationId,
        destinationTitle,
        bookingId: bookingId || '',
        userId: userId || '',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
