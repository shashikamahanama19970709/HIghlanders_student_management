import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword, newEmail } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Find valid password reset code
    const resetRecord = await db.collection('passwordResets').findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update parameters
    const updateFields: Record<string, any> = {
      password: newPassword,
      plainPassword: newPassword,
      updatedAt: new Date()
    };

    const finalEmail = newEmail ? newEmail.trim().toLowerCase() : email;
    if (newEmail && finalEmail !== email.toLowerCase()) {
      // Ensure new email is not already taken
      const emailTaken = await db.collection('users').findOne({ email: finalEmail });
      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: 'The requested new email is already in use' },
          { status: 400 }
        );
      }
      updateFields.email = finalEmail;
    }

    // Update user
    await db.collection('users').updateOne(
      { email },
      { $set: updateFields }
    );

    // Also update memberRequests to keep email and plain password in sync
    if (user.role === 'student') {
      await db.collection('memberRequests').updateOne(
        { email },
        { 
          $set: { 
            plainPassword: newPassword, 
            email: finalEmail, 
            updatedAt: new Date() 
          } 
        }
      );
    }

    // Delete password reset record
    await db.collection('passwordResets').deleteOne({ email });

    // Send email confirmation
    const emailSubject = 'Highlanders Taekwondo - Account Credentials Updated';
    const emailText = `Hello,

This is a confirmation that your account login credentials have been successfully updated.

Your login email is: ${finalEmail}

If you did not perform this action, please contact management immediately.

Best regards,
Highlanders Amateur Taekwondo CIC Team`;

    const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #0A1128; border-bottom: 2px solid #E35E1C; padding-bottom: 10px;">Security Update</h2>
      <p>Hello,</p>
      <p>This is a confirmation that your account login credentials for Highlanders Taekwondo have been successfully updated.</p>
      <div style="background-color: #f7f9fc; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #333;">Account Status: Updated</p>
        <p style="margin: 5px 0 0 0; color: #666;">Login Email: ${finalEmail}</p>
      </div>
      <p>You can now use your new credentials to log in to the student portal.</p>
      <p>If you did not initiate this change, please notify the Highlanders Taekwondo administration immediately to secure your account.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 11px; color: #888;">Highlanders Amateur Taekwondo CIC. All rights reserved.</p>
    </div>`;

    await sendEmail({
      to: email, // send notification to old email to inform them
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      senderType: 'admin',
    });

    // If email changed, also notify the new email address
    if (newEmail && finalEmail !== email.toLowerCase()) {
      await sendEmail({
        to: finalEmail,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        senderType: 'admin',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials updated successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
