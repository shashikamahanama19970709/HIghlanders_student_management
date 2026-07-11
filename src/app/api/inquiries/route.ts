import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendEmail } from '@/lib/mail';

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

    // Notify Front Desk (info@highlanderstaekwondo.club)
    await sendEmail({
      to: process.env.INFO_EMAIL || 'info@highlanderstaekwondo.club',
      subject: `New Public Inquiry: ${subject}`,
      text: `You have received a new inquiry from the website contact form.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nPreferred Class: ${preferredClass || 'None specified'}\n\nSubject: ${subject}\nMessage:\n${message}\n\n---\nManage inquiries in the Admin Dashboard.`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h2 style="color: #0A1128; border-bottom: 2px solid #E35E1C; padding-bottom: 10px;">New Website Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Preferred Class:</strong> ${preferredClass || 'None specified'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color: #f7f9fc; padding: 15px; border-radius: 4px; margin-top: 15px;">
          <p style="margin: 0; font-weight: bold;">Message:</p>
          <p style="margin: 5px 0 0 0; white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #888;">This is an automated notification from Highlanders Taekwondo Portal.</p>
      </div>`,
      senderType: 'info'
    });

    // Confirm receipt to the user who submitted the inquiry
    await sendEmail({
      to: email,
      subject: `Inquiry Received - Highlanders Taekwondo`,
      text: `Hello ${name},\n\nThank you for reaching out to Highlanders Amateur Taekwondo. We have received your inquiry regarding "${subject}" and our team will get back to you as soon as possible.\n\nHere is a copy of your message:\n"${message}"\n\nBest regards,\nHighlanders Front Desk`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h2 style="color: #0A1128; border-bottom: 2px solid #E35E1C; padding-bottom: 10px;">Inquiry Received</h2>
        <p>Hello ${name},</p>
        <p>Thank you for reaching out to Highlanders Amateur Taekwondo. We have received your inquiry and our team will get back to you as soon as possible.</p>
        <div style="background-color: #f7f9fc; padding: 15px; border-radius: 4px; border-left: 4px solid #E35E1C; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #555;">Summary of your message:</p>
          <p style="margin: 5px 0 0 0; font-style: italic; color: #777;">"${message}"</p>
        </div>
        <p>If you have any urgent questions, feel free to reply directly to this email or call us at our front desk.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 11px; color: #888;">Highlanders Amateur Taekwondo CIC. All rights reserved.</p>
      </div>`,
      senderType: 'info'
    });

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
