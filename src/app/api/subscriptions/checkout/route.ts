import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth';
import { StripeService } from '@/lib/stripe';
import { sendEmail } from '@/lib/mail';
import { ObjectId } from 'mongodb';

// Helper to authenticate student
async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = AuthService.extractTokenFromHeaders(authHeader || undefined);
  if (!token) return null;
  return await AuthService.getUserFromToken(token);
}

// POST /api/subscriptions/checkout - Create Checkout Session
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await request.json();
    if (!subscriptionId) {
      return NextResponse.json({ success: false, error: 'Subscription ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const plan = await db.collection('subscriptions').findOne({ _id: new ObjectId(subscriptionId) });
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Subscription plan not found' }, { status: 404 });
    }

    const origin = request.nextUrl.origin;
    const successUrl = `${origin}/student/subscription`;
    const cancelUrl = `${origin}/student/subscription`;

    const checkout = await StripeService.createCheckoutSession({
      priceId: plan.stripePriceId,
      customerEmail: user.email,
      successUrl,
      cancelUrl,
      metadata: {
        userId: user._id.toString(),
        email: user.email,
        subscriptionId: plan._id.toString(),
      },
    });

    // Save temporary session mapping to verify on redirect
    await db.collection('checkoutSessions').updateOne(
      { sessionId: checkout.id },
      { 
        $set: { 
          sessionId: checkout.id, 
          email: user.email, 
          subscriptionId: plan._id.toString(), 
          status: 'pending',
          createdAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkout.id,
        checkoutUrl: checkout.url,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/subscriptions/checkout - Confirm Checkout Session
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Check if session exists in our DB
    const sessionRecord = await db.collection('checkoutSessions').findOne({ sessionId, email: user.email });
    if (!sessionRecord) {
      return NextResponse.json({ success: false, error: 'Checkout session not found' }, { status: 404 });
    }

    if (sessionRecord.status === 'completed') {
      // Already processed
      return NextResponse.json({
        success: true,
        message: 'Subscription already activated',
      });
    }

    // Retrieve session status from Stripe/Mock
    const session = await StripeService.retrieveSession(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ success: false, error: 'Payment has not been completed' }, { status: 400 });
    }

    // Get the plan
    const plan = await db.collection('subscriptions').findOne({ _id: new ObjectId(sessionRecord.subscriptionId) });
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan details not found' }, { status: 404 });
    }

    // Calculate billing cycle expiration date
    const now = new Date();
    const nextPaymentDate = new Date();
    if (plan.billingCycle === 'quarterly') {
      nextPaymentDate.setDate(now.getDate() + 90);
    } else if (plan.billingCycle === 'yearly') {
      nextPaymentDate.setDate(now.getDate() + 365);
    } else {
      // monthly
      nextPaymentDate.setDate(now.getDate() + 30);
    }

    // Update user document with active subscription
    await db.collection('users').updateOne(
      { email: user.email },
      {
        $set: {
          subscription: {
            planId: plan._id.toString(),
            planName: plan.name,
            price: plan.price,
            billingCycle: plan.billingCycle,
            status: 'active',
            startDate: now,
            nextPaymentDate: nextPaymentDate,
            stripeSubscriptionId: sessionId,
          },
          updatedAt: now,
        }
      }
    );

    // Save payment history record
    const paymentRecord = {
      email: user.email,
      amount: plan.price,
      status: 'completed',
      planName: plan.name,
      billingCycle: plan.billingCycle,
      paymentMethod: 'card',
      transactionId: sessionId,
      invoiceUrl: sessionId.startsWith('mock-cs-') ? 'https://stripe.com/docs/invoices' : `https://dashboard.stripe.com/invoices/${sessionId}`,
      receiptUrl: sessionId.startsWith('mock-cs-') ? 'https://stripe.com/docs/receipts' : `https://dashboard.stripe.com/payments`,
      createdAt: now,
    };
    await db.collection('payments').insertOne(paymentRecord);

    // Update session record status
    await db.collection('checkoutSessions').updateOne(
      { sessionId },
      { $set: { status: 'completed', updatedAt: now } }
    );

    // Send email confirmation
    const emailSubject = 'Highlanders Taekwondo - Subscription Activated!';
    const emailText = `Hello,

Thank you for subscribing to Highlanders Taekwondo!
Your plan "${plan.name}" (£${plan.price}/${plan.billingCycle}) is now active.

Your next payment is scheduled for ${nextPaymentDate.toLocaleDateString()}.
You can manage your billing details and review invoices directly from the billing section of your student portal.

Best regards,
Highlanders Amateur Taekwondo CIC Team`;

    const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #0A1128; border-bottom: 2px solid #E35E1C; padding-bottom: 10px;">Subscription Activated!</h2>
      <p>Hello,</p>
      <p>Thank you for subscribing to Highlanders Amateur Taekwondo CIC! Your membership plan is now active.</p>
      
      <div style="background-color: #f7f9fc; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #333;">Subscription Details:</p>
        <p style="margin: 5px 0 0 0; color: #555;">Plan Name: <strong>${plan.name}</strong></p>
        <p style="margin: 5px 0 0 0; color: #555;">Price: <strong>£${plan.price} / ${plan.billingCycle}</strong></p>
        <p style="margin: 5px 0 0 0; color: #555;">Status: <span style="color: #2e7d32; font-weight: bold;">Active</span></p>
        <p style="margin: 5px 0 0 0; color: #555;">Next Billing Date: <strong>${nextPaymentDate.toLocaleDateString()}</strong></p>
      </div>

      <p>Your automatic billing is set up, and payment will occur automatically. You can review invoices or update your subscription at any time in the student portal dashboard.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 11px; color: #888;">Highlanders Amateur Taekwondo CIC. All rights reserved.</p>
    </div>`;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      senderType: 'admin',
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully activated',
    });
  } catch (error) {
    console.error('Confirm checkout error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
