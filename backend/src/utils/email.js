import nodemailer from "nodemailer";

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const transporter = getTransporter();

  // Dev fallback — log to console when SMTP is not configured
  if (!transporter) {
    console.log(`[DEV] Password reset link for ${toEmail}: ${resetUrl}`);
    return;
  }

  const from = process.env.EMAIL_FROM || '"SecureBank" <noreply@securebank.com>';

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: "Reset your SecureBank password",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="440" cellpadding="0" cellspacing="0"
                  style="background:#111111;border:1px solid #1E1E1E;border-radius:16px;padding:36px 32px;">
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
                        <div style="width:38px;height:38px;background:#DC2626;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
                          <span style="color:#FAFAFA;font-size:18px;font-weight:700;">S</span>
                        </div>
                        <span style="font-size:16px;font-weight:700;color:#FAFAFA;letter-spacing:-0.02em;vertical-align:middle;margin-left:10px;">SecureBank</span>
                      </div>
                      <h1 style="font-size:22px;font-weight:700;color:#FAFAFA;margin:0 0 8px;letter-spacing:-0.02em;">
                        Reset your password
                      </h1>
                      <p style="font-size:13px;color:#52525B;margin:0 0 28px;line-height:1.6;">
                        We received a request to reset the password for your SecureBank account.
                        Click the button below to set a new password. This link expires in <strong style="color:#A1A1AA;">1 hour</strong>.
                      </p>
                      <a href="${resetUrl}"
                        style="display:block;width:100%;padding:13px;background:#DC2626;border-radius:9px;color:#FAFAFA;
                               font-size:14px;font-weight:600;text-align:center;text-decoration:none;box-sizing:border-box;">
                        Reset Password
                      </a>
                      <p style="font-size:12px;color:#3F3F46;margin:20px 0 0;line-height:1.6;">
                        If you didn't request this, you can safely ignore this email — your password will not change.
                        <br/>Never share this link with anyone.
                      </p>
                      <hr style="border:none;border-top:1px solid #1E1E1E;margin:24px 0 16px;" />
                      <p style="font-size:11px;color:#3F3F46;margin:0;word-break:break-all;">
                        Or copy this URL into your browser:<br/>
                        <span style="color:#52525B;">${resetUrl}</span>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Reset your SecureBank password\n\nClick the link below (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  });
};
