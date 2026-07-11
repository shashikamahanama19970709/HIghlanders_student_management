import nodemailer from 'nodemailer';

export type EmailSenderType = 'info' | 'admin' | 'coaching';

interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
  senderType?: EmailSenderType;
}

export async function sendEmail({ to, subject, text, html, senderType = 'admin' }: SendMailParams): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');

  let user = '';
  let pass = '';
  let from = '';

  if (senderType === 'info') {
    user = process.env.INFO_EMAIL || process.env.SMTP_USER || 'info@highlanderstaekwondo.club';
    pass = process.env.INFO_PASSWORD || process.env.SMTP_PASS || '';
    from = `"Highlanders Front Desk" <${user}>`;
  } else if (senderType === 'coaching') {
    user = process.env.COACHING_EMAIL || 'coaching@highlanderstaekwondo.club';
    // Fall back to admin or general credentials if no coaching password is set
    pass = process.env.COACHING_PASSWORD || process.env.ADMIN_PASSWORD || process.env.SMTP_PASS || '';
    from = `"Highlanders Coaching Hub" <${user}>`;
  } else {
    // default to admin
    user = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@highlanderstaekwondo.club';
    pass = process.env.ADMIN_PASSWORD || process.env.SMTP_PASS || '';
    from = `"Highlanders System Core" <${user}>`;
  }

  const isConfigured = 
    !!(host && 
    user && 
    pass && 
    user !== 'placeholder@gmail.com' && 
    pass !== 'placeholder_password' &&
    user !== 'info@highlanderstkd.com');

  console.log(`[Email Service] Preparing to send email:
  - Sender: ${from} (type: ${senderType})
  - To: ${to}
  - Subject: ${subject}
  - Status: ${isConfigured ? 'Configured (SMTP)' : 'Unconfigured/Placeholder (Console Mock)'}`);

  if (!isConfigured) {
    console.log('==================================================');
    console.log(`MOCK EMAIL SENT FROM: ${from}`);
    console.log(`TO: ${to}`);
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

    console.log(`[Email Service] Email sent successfully from ${from} to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Error sending email from ${from} to ${to}:`, error);
    // Return false on error so callers can track success status if needed.
    return false;
  }
}

