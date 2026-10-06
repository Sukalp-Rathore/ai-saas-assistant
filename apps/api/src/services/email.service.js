import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = env.smtpHost
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : null;

export async function sendInviteEmail({ to, orgName, inviterName, token, role }) {
  const acceptUrl = `${env.appUrl}/login?invite=${encodeURIComponent(token)}`;
  const subject = `You've been invited to join ${orgName} on Sukalp SaaS`;
  const text = `Hi,

${inviterName || "Someone"} has invited you to join ${orgName} as a ${role} on Sukalp SaaS.

Click the link below to accept the invitation:
${acceptUrl}

This invitation will expire in 7 days.

If you did not expect this invitation, you can safely ignore this email.
`;
  const html = `<p>Hi,</p>
<p><strong>${inviterName || "Someone"}</strong> has invited you to join <strong>${orgName}</strong> as a <strong>${role}</strong> on Sukalp SaaS.</p>
<p><a href="${acceptUrl}" style="display:inline-block;padding:0.75rem 1.25rem;background:#0d6efd;color:#fff;text-decoration:none;border-radius:0.375rem;">Accept Invitation</a></p>
<p>Or copy this link into your browser:<br/><code>${acceptUrl}</code></p>
<p>This invitation will expire in 7 days.</p>
<p>If you did not expect this invitation, you can safely ignore this email.</p>
`;

  if (!transporter) {
    console.log(`[EMAIL] To: ${to}\nSubject: ${subject}\n\n${text}`);
    return { mocked: true };
  }

  return transporter.sendMail({
    from: env.smtpFrom || env.smtpUser,
    to,
    subject,
    text,
    html,
  });
}
