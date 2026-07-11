import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const { memberId, email, password } = await request.json();

    if (!memberId || !email) {
      return NextResponse.json(
        { success: false, error: 'Member ID and email are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');

    // 1. Fetch the member request to get their details
    const memberRequest = await db.collection('memberRequests').findOne({ _id: new ObjectId(memberId) });
    if (!memberRequest) {
      return NextResponse.json(
        { success: false, error: 'Member onboarding request not found' },
        { status: 404 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: memberRequest.email });

    if (!existingUser && !password) {
      return NextResponse.json(
        { success: false, error: 'Password is required to set credentials for the first time' },
        { status: 400 }
      );
    }

    const finalEmail = email.trim().toLowerCase();

    if (existingUser) {
      // Update existing user credentials
      const updateFields: Record<string, any> = { 
        email: finalEmail,
        updatedAt: new Date()
      };
      
      if (password) {
        updateFields.password = password;
        updateFields.plainPassword = password;
      }

      await db.collection('users').updateOne(
        { _id: existingUser._id },
        { $set: updateFields }
      );
    } else {
      // Create a new user document
      const newUser = {
        email: finalEmail,
        password: password,
        plainPassword: password,
        role: 'student',
        profile: {
          firstName: memberRequest.firstName,
          lastName: memberRequest.lastName,
          phone: memberRequest.phone,
          dateOfBirth: memberRequest.dateOfBirth,
          isMinor: memberRequest.isMinor,
          parentGuardian: memberRequest.parentGuardian,
          emergencyContact: memberRequest.emergencyContact,
          medicalInfo: memberRequest.medicalInfo || '',
          address: '',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection('users').insertOne(newUser);
    }

    // 4. Update the email and set credentialsCreated status in memberRequests
    const memberUpdateFields: Record<string, any> = {
      credentialsCreated: true, 
      email: finalEmail, 
      updatedAt: new Date()
    };
    if (password) {
      memberUpdateFields.plainPassword = password;
    }

    await db.collection('memberRequests').updateOne(
      { _id: new ObjectId(memberId) },
      { $set: memberUpdateFields }
    );

    // 5. Send credentials notification email
    const loginUrl = `${request.nextUrl.origin}/login`;
    const emailSubject = password 
      ? 'Welcome to Highlanders Taekwondo - Your Account Credentials' 
      : 'Highlanders Taekwondo - Account Credentials Updated';
    
    const emailText = password 
      ? `Hello ${memberRequest.firstName},

Welcome to Highlanders Amateur Taekwondo CIC!
Your student portal account has been set up by the administration.

You can log in to your student dashboard using the following credentials:
Portal Link: ${loginUrl}
Username/Email: ${finalEmail}
Password: ${password}

Upon logging in, you will be able to update your profile, view class schedules, and subscribe to membership plans.
If you wish to change your username or password, you can do so through the forgot password flow on the login page which sends a verification code to this email.

Best regards,
Highlanders Amateur Taekwondo CIC Team`
      : `Hello ${memberRequest.firstName},

Your student portal account credentials have been updated by the administration.

Username/Email: ${finalEmail}
Password: (Unchanged)

Portal Link: ${loginUrl}

Best regards,
Highlanders Amateur Taekwondo CIC Team`;

    const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #0A1128; border-bottom: 2px solid #E35E1C; padding-bottom: 10px;">${password ? 'Welcome to Highlanders Taekwondo!' : 'Account Credentials Updated'}</h2>
      <p>Hello ${memberRequest.firstName},</p>
      <p>${password ? 'Welcome to Highlanders Amateur Taekwondo CIC! Your student account has been successfully set up by the system administrator.' : 'Your student account login credentials have been updated by the system administrator.'}</p>
      
      <div style="background-color: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0A1128;">Your Login Credentials</h3>
        <p style="margin: 5px 0;"><strong>Student Portal:</strong> <a href="${loginUrl}" style="color: #E35E1C; text-decoration: underline;">${loginUrl}</a></p>
        <p style="margin: 5px 0;"><strong>Username (Email):</strong> ${finalEmail}</p>
        ${password ? `<p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #edf2f7; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code></p>` : `<p style="margin: 5px 0;"><strong>Password:</strong> <em>Unchanged</em></p>`}
      </div>

      <p style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 12px; font-size: 13px; color: #7b341e;">
        <strong>Security Tip:</strong> You can reset this password and username at any time from the portal login page by clicking "Forgot password?", which will send a verification code to your email.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #E35E1C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Login Portal</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 11px; color: #888;">Highlanders Amateur Taekwondo CIC. All rights reserved.</p>
    </div>`;

    await sendEmail({
      to: finalEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      senderType: 'coaching',
    });

    return NextResponse.json({
      success: true,
      message: password
        ? `Credentials set and student informed successfully via ${finalEmail}`
        : `Credentials updated successfully. Student login email is now ${finalEmail}.`,
    });
  } catch (error) {
    console.error('Set credentials error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
