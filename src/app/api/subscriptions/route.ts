import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { StripeService } from '@/lib/stripe';

// GET /api/subscriptions - List active subscriptions
export async function GET() {
  try {
    const db = await getDatabase();
    let subscriptions = await db.collection('subscriptions').find({ isActive: true }).toArray();

    return NextResponse.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create new subscription (Admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, billingCycle, classes, features } = body;

    if (!name || !price || !billingCycle) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and billing cycle are required' },
        { status: 400 }
      );
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // 1. Create Product and Price in Stripe (or returns mock ID)
    const stripePriceId = await StripeService.createProductAndPrice(
      name,
      description || '',
      priceNum,
      billingCycle
    );

    // 2. Save subscription to DB
    const db = await getDatabase();
    const newSubscription = {
      name,
      description: description || '',
      price: priceNum,
      currency: 'gbp',
      billingCycle,
      classes: classes || [],
      features: features || [],
      isActive: true,
      stripePriceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('subscriptions').insertOne(newSubscription);

    return NextResponse.json({
      success: true,
      data: { ...newSubscription, _id: result.insertedId.toString() },
      message: 'Subscription plan created successfully'
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}
