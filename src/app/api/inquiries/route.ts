import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface InquiryRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferredClass?: string;
}

// POST /api/inquiries - Create a new inquiry
export async function POST(request: NextRequest) {
  try {
    const body: InquiryRequest = await request.json();
    const { name, email, phone, subject, message, preferredClass } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const inquiry = {
      name,
      email,
      phone: phone || '',
      subject,
      message,
      preferredClass: preferredClass || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('inquiries').insertOne(inquiry);

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...inquiry,
      },
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

// GET /api/inquiries - Fetch all inquiries (for admin)
export async function GET() {
  try {
    const db = await getDatabase();
    const inquiries = await db.collection('inquiries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// PUT /api/inquiries - Update inquiry status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, status } = body;

    if (!_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID and status are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const queryId = ObjectId.isValid(_id) ? new ObjectId(_id) : _id;
    
    const result = await db.collection('inquiries').updateOne(
      { _id: queryId },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    const updatedInquiry = await db.collection('inquiries').findOne({ _id: queryId });

    return NextResponse.json({
      success: true,
      data: updatedInquiry,
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

// DELETE /api/inquiries - Delete an inquiry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const result = await db.collection('inquiries').deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
