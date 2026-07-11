import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if user exists in database
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      // Return success to prevent email enumeration, but log internally
      console.log(`[Forgot Password] Request for non-existent email: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a verification code shortly.',
      });
    }

    // Generate 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Save or update OTP in passwordResets collection
    await db.collection('passwordResets').updateOne(
      { email },
      { 
        $set: { 
          email, 
          otp, 
          expiresAt, 
          createdAt: new Date() 
        } 
      },
      { upsert: true }
    );

    // Send email with nodemailer
    const emailSubject = 'Highlanders Taekwondo - Password Reset Verification Code';
    const emailText = `Hello,

You have requested to reset your password or change your login credentials.
Your 6-digit verification code is: ${otp}

This code will expire in 15 minutes.

If you did not request this, please ignore this email.

Best regards,
Highlanders Amateur Taekwondo CIC Team`;

    const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #0A1128; border-bottom: 2px solid #E35E1C; padding-bottom: 10px;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You have requested to reset your password or change your login credentials for your Highlanders Taekwondo account.</p>
      <div style="background-color: #f7f9fc; border-left: 4px solid #E35E1C; padding: 15px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #555; margin: 0 0 10px 0;">Your 6-digit verification code is:</p>
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #E35E1C;">${otp}</span>
      </div>
      <p>This code will expire in <strong>15 minutes</strong>.</p>
      <p>If you did not request this change, please ignore this email and your password will remain secure.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 11px; color: #888;">Highlanders Amateur Taekwondo CIC. All rights reserved.</p>
    </div>`;

    await sendEmail({
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      senderType: 'admin',
    });

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive a verification code shortly.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
