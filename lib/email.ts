import nodemailer from 'nodemailer';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.EMAIL_FROM || 'Finance Tracker <no-reply@finance-tracker.app>';

const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

function buildHtmlTemplate(title: string, message: string, actionText: string, actionLink: string) {
  return `
    <html>
      <body style="margin:0;padding:0;background:#f5f3ef;color:#201a11;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e8e3d9;">
                <tr>
                  <td style="background:#201a11;padding:28px;text-align:center;color:#f5f3ef;font-size:24px;font-weight:700;">
                    Finance Tracker
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 40px;color:#201a11;">
                    <h1 style="font-size:22px;margin:0 0 16px;">${title}</h1>
                    <p style="margin:0 0 24px;line-height:1.7;color:#5e4d33;">${message}</p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${actionLink}" style="display:inline-block;padding:14px 28px;background:#201a11;color:#f5f3ef;text-decoration:none;border-radius:999px;font-weight:600;">${actionText}</a>
                    </div>
                    <p style="font-size:14px;color:#9c8865;margin:0;">If the button does not work, copy and paste the following link into your browser:</p>
                    <p style="font-size:12px;color:#7d6745;word-break:break-all;">${actionLink}</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f5f3ef;padding:24px;text-align:center;color:#9c8865;font-size:12px;">
                    Finance Tracker • Secure verification for your account
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/auth/verify?token=${encodeURIComponent(token)}`;
  const subject = 'Verify your Finance Tracker account';
  const html = buildHtmlTemplate(
    'Verify your email address',
    `Thanks for signing up, ${name}! Click the button below to verify your email and activate your account. This link expires in 15 minutes.`,
    'Verify email',
    link,
  );

  if (!transport) {
    console.log('Email verification link:', link);
    return;
  }

  await transport.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
  });
}

export async function sendResetPasswordEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const subject = 'Reset your Finance Tracker password';
  const html = buildHtmlTemplate(
    'Reset your password',
    `Hello ${name}, we received a request to reset your password. Click the button below to set a new password. This link expires in 15 minutes.`,
    'Reset password',
    link,
  );

  if (!transport) {
    console.log('Password reset link:', link);
    return;
  }

  await transport.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
  });
}
