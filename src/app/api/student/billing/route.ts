import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth';

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = AuthService.extractTokenFromHeaders(authHeader || undefined);
  if (!token) return null;
  return await AuthService.getUserFromToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();

    // Fetch payments matching user's email
    const payments = await db.collection('payments')
      .find({ email: user.email })
      .sort({ createdAt: -1 })
      .toArray();

    // Map database payments to client BillingRecord format
    const billingRecords = payments.map(pay => ({
      id: pay._id.toString(),
      date: pay.createdAt ? new Date(pay.createdAt).toISOString() : new Date().toISOString(),
      amount: pay.amount,
      status: pay.status === 'completed' || pay.status === 'paid' ? 'paid' : (pay.status === 'failed' ? 'failed' : 'pending'),
      description: pay.planName ? `Monthly Membership - ${pay.planName}` : 'Club Training Fee',
      invoiceUrl: pay.invoiceUrl || 'https://stripe.com/docs/invoices',
      receiptUrl: pay.receiptUrl || 'https://stripe.com/docs/receipts'
    }));

    return NextResponse.json({
      success: true,
      data: billingRecords
    });
  } catch (error) {
    console.error('Error fetching billing records:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
