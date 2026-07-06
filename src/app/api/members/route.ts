import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { MemberRequest } from '@/types';

// GET /api/members - Get member requests (admin only)
export async function GET() {
  try {
    const db = await getDatabase();
    const memberRequests = await db.collection('memberRequests').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      data: memberRequests,
    });
  } catch (error) {
    console.error('Error fetching member requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch member requests' },
      { status: 500 }
    );
  }
}

// POST /api/members - Submit member request
export async function POST(request: NextRequest) {
  try {
    const memberData: Omit<MemberRequest, '_id' | 'createdAt' | 'updatedAt' | 'status'> = await request.json();
    
    // Validate required fields
    if (!memberData.firstName || !memberData.lastName || !memberData.email || !memberData.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const db = await getDatabase();
    const existingRequest = await db.collection('memberRequests').findOne({ email: memberData.email });
    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'An application with this email already exists' },
        { status: 400 }
      );
    }

    const newMemberRequest = {
      ...memberData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('memberRequests').insertOne(newMemberRequest);
    
    return NextResponse.json({
      success: true,
      data: { ...newMemberRequest, _id: result.insertedId.toString() },
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting member request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// PATCH /api/members - Update member request status and create user if approved
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing parameters' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');

    // Find the member request first
    const memberRequest = await db.collection('memberRequests').findOne({ _id: new ObjectId(id) });
    if (!memberRequest) {
      return NextResponse.json(
        { success: false, error: 'Member request not found' },
        { status: 404 }
      );
    }

    // Update the request status
    await db.collection('memberRequests').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    // If approved, create a student user account
    if (status === 'approved') {
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email: memberRequest.email });
      if (!existingUser) {
        const bcrypt = await import('bcryptjs');
        // Hash a default password
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newUser = {
          email: memberRequest.email,
          password: hashedPassword,
          role: 'student',
          profile: {
            firstName: memberRequest.firstName,
            lastName: memberRequest.lastName,
            phone: memberRequest.phone,
            dateOfBirth: memberRequest.dateOfBirth,
            isMinor: memberRequest.isMinor,
            parentGuardian: memberRequest.parentGuardian,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collection('users').insertOne(newUser);
        
        return NextResponse.json({
          success: true,
          message: `Member approved. Student account created for ${memberRequest.email} with password "${defaultPassword}"`,
          data: { email: memberRequest.email, password: defaultPassword }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Member request status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating member request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update member request' },
      { status: 500 }
    );
  }
}

