import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendResetEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: "Reset your Monflo password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Reset your password</h2>
        <p style="font-size: 14px; color: #666; margin: 0 0 24px; line-height: 1.5;">
          We received a request to reset your Monflo account password. Click the button below to set a new password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #6366f1; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 32px; border-radius: 12px; text-decoration: none;">
          Reset Password
        </a>
        <p style="font-size: 12px; color: #999; margin: 24px 0 0; line-height: 1.5;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
