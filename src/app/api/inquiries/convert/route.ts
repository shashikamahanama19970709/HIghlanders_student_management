import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { inquiryId } = await request.json();

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const queryId = ObjectId.isValid(inquiryId) ? new ObjectId(inquiryId) : inquiryId;

    // 1. Fetch Inquiry
    const inquiry = await db.collection('inquiries').findOne({ _id: queryId as any });
    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: inquiry.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A student account with this email already exists' },
        { status: 400 }
      );
    }

    // 3. Split Name into First and Last
    const nameParts = (inquiry.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Student';
    const lastName = nameParts.slice(1).join(' ') || 'Member';

    // 4. Encrypt default password
    const bcrypt = await import('bcryptjs');
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 5. Create user record
    const newUser = {
      email: inquiry.email,
      password: hashedPassword,
      role: 'student',
      profile: {
        firstName,
        lastName,
        phone: inquiry.phone || '',
        dateOfBirth: '',
        classIds: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').insertOne(newUser);

    // 6. Sync to memberRequests as approved
    const newMemberRequest = {
      firstName,
      lastName,
      email: inquiry.email,
      phone: inquiry.phone || '',
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('memberRequests').insertOne(newMemberRequest);

    // 7. Resolve the Inquiry
    await db.collection('inquiries').updateOne(
      { _id: queryId as any },
      { $set: { status: 'resolved', updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: `Student account created for ${inquiry.email} with password "${defaultPassword}"`
    });
  } catch (error) {
    console.error('Error converting inquiry to student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to convert inquiry to student' },
      { status: 500 }
    );
  }
}
