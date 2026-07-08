import nodemailer from 'nodemailer';

interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: SendMailParams): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'info@highlanderstkd.com';

  const isConfigured = 
    !!(host && 
    user && 
    pass && 
    user !== 'placeholder@gmail.com' && 
    pass !== 'placeholder_password');

  console.log(`[Email Service] Preparing to send email:
  - To: ${to}
  - Subject: ${subject}
  - Status: ${isConfigured ? 'Configured (SMTP)' : 'Unconfigured/Placeholder (Console Mock)'}`);

  if (!isConfigured) {
    console.log('==================================================');
    console.log(`MOCK EMAIL SENT TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TEXT CONTENT:\n${text}`);
    console.log('==================================================');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`[Email Service] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('[Email Service] Error sending email:', error);
    // Return true even on error so that flow doesn't crash during testing,
    // but log the error clearly.
    return false;
  }
}
