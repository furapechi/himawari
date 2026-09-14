import { encodeMessage, type ContactMessage } from "./contact-mail";

export type MailFailureKind = "retry" | "failed" | "uncertain";
export class MailDeliveryError extends Error {
  constructor(public code: string, public kind: MailFailureKind) { super(code); }
}

export function isMailConfigured() {
  return process.env.CONTACT_MAIL_ENABLED === "true" && Boolean(
    process.env.GOOGLE_MAIL_CLIENT_ID && process.env.GOOGLE_MAIL_CLIENT_SECRET && process.env.GOOGLE_MAIL_REFRESH_TOKEN,
  );
}

async function getAccessToken() {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.GOOGLE_MAIL_CLIENT_ID!, client_secret: process.env.GOOGLE_MAIL_CLIENT_SECRET!, refresh_token: process.env.GOOGLE_MAIL_REFRESH_TOKEN!, grant_type: "refresh_token" }),
    });
    if (!response.ok) throw new MailDeliveryError(`google_auth_${response.status}`, response.status >= 500 || response.status === 429 ? "retry" : "failed");
    const data = await response.json() as { access_token?: string };
    if (!data.access_token) throw new MailDeliveryError("google_auth_missing_token", "failed");
    return data.access_token;
  } catch (error) {
    if (error instanceof MailDeliveryError) throw error;
    throw new MailDeliveryError("google_auth_unavailable", "retry");
  }
}

export async function sendGoogleMail(message: ContactMessage, messageId: string) {
  if (!isMailConfigured()) throw new MailDeliveryError("mail_not_configured", "retry");
  const raw = encodeMessage(message, messageId);
  const accessToken = await getAccessToken();
  try {
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ raw }),
    });
    if (!response.ok) {
      // A timeout or 5xx may have happened after Google accepted the message. Do not blindly resend.
      const kind = response.status === 429 ? "retry" : response.status >= 500 ? "uncertain" : "failed";
      throw new MailDeliveryError(`gmail_send_${response.status}`, kind);
    }
    const result = await response.json() as { id?: string };
    if (!result.id) throw new MailDeliveryError("gmail_missing_id", "uncertain");
    return result.id;
  } catch (error) {
    if (error instanceof MailDeliveryError) throw error;
    throw new MailDeliveryError("gmail_send_unknown", "uncertain");
  }
}
