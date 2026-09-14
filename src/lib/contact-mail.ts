import { CONTACT_EMAIL, CONTACT_HOURS, CONTACT_PHONE, CONTACT_SITE } from "./contact-config";
import type { ContactPayload } from "./contact";

export type MailKind = "staff" | "customer";
export type ContactMessage = { to: string; replyTo: string; subject: string; text: string; html: string };

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

const signature = `ひまわりFC\n児童発達支援・放課後等デイサービス\n電話：${CONTACT_PHONE}\nメール：${CONTACT_EMAIL}\n受付時間：${CONTACT_HOURS}\n定休日：日曜日・年末年始\n〒270-1151 千葉県我孫子市本町3-5-25 渋谷ビル2F\n${CONTACT_SITE}\n運営：ベル不動産企画株式会社`;

function emailLayout(heading: string, text: string, reference: string) {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"></head><body style="margin:0;background:#fffaf0;color:#25362f;font-family:Arial,'Hiragino Kaku Gothic ProN',sans-serif"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:32px 16px"><table role="presentation" style="max-width:620px;width:100%;margin:auto;border-collapse:collapse;background:#ffffff"><tr><td style="padding:28px;background:#174b3b;color:#fff"><strong style="font-size:24px">ひまわりFC</strong><div style="font-size:11px;margin-top:6px">HIMAWARI FOOTBALL CLUB</div></td></tr><tr><td style="padding:30px 24px"><p style="color:#34725a;font-size:12px">受付番号 ${escapeHtml(reference)}</p><h1 style="font-size:22px;line-height:1.6">${escapeHtml(heading)}</h1><div style="font-size:14px;line-height:1.9;overflow-wrap:anywhere">${escapeHtml(text).replace(/\n/g, "<br>")}</div></td></tr><tr><td style="padding:18px 24px;background:#deeee4;font-size:12px;color:#174b3b">一人ひとりの「できた！」を、大きな自信へ。</td></tr></table></td></tr></table></body></html>`;
}

export function buildContactMessage(kind: MailKind, data: ContactPayload, reference: string, createdAt: Date): ContactMessage {
  if (!/^HF-\d{6,20}$/.test(reference)) throw new Error("Invalid contact reference");
  const received = new Intl.DateTimeFormat("ja-JP", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(createdAt);
  if (kind === "customer") {
    // Do not echo unverified free text or sensitive child information to an unverified address.
    const subject = `【ひまわりFC】お問い合わせを受け付けました（${reference}）`;
    const text = `このたびは、ひまわりFCへお問い合わせいただき、誠にありがとうございます。\nお送りいただいたお問い合わせを、以下の受付番号で承りました。\n\n受付番号：${reference}\n受付日時：${received}\n\n担当者が内容を確認し、通常2〜3営業日以内を目安に、ご希望の連絡方法に沿ってご連絡いたします。\n日曜日・年末年始などの休業日を挟む場合は、お時間をいただくことがございます。あらかじめご了承ください。\n\n見学・体験をご希望の場合、今回の送信のみでご予約は確定しておりません。担当者からのご案内をお待ちください。\n\n追加のご連絡や訂正がございましたら、このメールへご返信いただけます。お急ぎの場合や、3営業日を過ぎても連絡がない場合は、お手数ですがお電話で受付番号をお知らせください。\n\nお子さまとご家族に安心してご相談いただけるよう、一つひとつ丁寧に対応してまいります。どうぞよろしくお願いいたします。\n\n※このメールはフォームからのお問い合わせに対する自動返信です。個人情報保護のため、ご相談内容の詳細は記載していません。\n※お心当たりのない場合は、このメールを削除してください。\n\n――――――――――\n${signature}`;
    return { to: data.email, replyTo: CONTACT_EMAIL, subject, text, html: emailLayout("お問い合わせありがとうございます", text, reference) };
  }
  const lines = [
    ["受付番号", reference], ["受付日時", received], ["お名前", data.name], ["ふりがな", data.nameKana || "未入力"],
    ["メールアドレス", data.email], ["電話番号", data.phone || "未入力"], ["お問い合わせ種別", data.inquiryType],
    ["お子さまの年代", data.childAge || "未入力"], ["通学・通園先", data.schoolName || "未入力"], ["ご希望の連絡方法", data.preferredContact],
  ].map(([label, value]) => `${label}：${value}`).join("\n");
  const text = `ホームページから新しいお問い合わせを受け付けました。\n通常2〜3営業日以内を目安に、ご希望の連絡方法でご対応ください。\nこのメールに返信すると、お問い合わせされた方へ返信できます。\n\n${lines}\n\n【ご相談内容（お客様による入力）】\n${data.message}\n\n個人情報を含むため、お取り扱いにご注意ください。\nこのメールはひまわりFCの問い合わせシステムから送信しています。`;
  return { to: CONTACT_EMAIL, replyTo: data.email, subject: `【ひまわりFC】新しいお問い合わせ（${reference}）`, text, html: emailLayout("新しいお問い合わせ", text, reference) };
}

export function encodeMessage(message: ContactMessage, messageId: string) {
  for (const address of [message.to, message.replyTo]) {
    if (!/^[A-Za-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(address)) throw new Error("Invalid mail address");
  }
  if (!/^[a-z0-9-]+$/.test(messageId)) throw new Error("Invalid message ID");
  const boundary = `himawari-${messageId}`;
  const encoded = (text: string) => Buffer.from(text, "utf8").toString("base64").match(/.{1,76}/g)?.join("\r\n") || "";
  const subjectParts: string[] = [];
  let part = "";
  for (const char of message.subject) {
    if (Buffer.byteLength(part + char) > 42) { subjectParts.push(part); part = ""; }
    part += char;
  }
  if (part) subjectParts.push(part);
  const subject = subjectParts.map((value) => `=?UTF-8?B?${Buffer.from(value).toString("base64")}?=`).join("\r\n ");
  const raw = [
    `From: =?UTF-8?B?${Buffer.from("ひまわりFC").toString("base64")}?= <${CONTACT_EMAIL}>`,
    `To: ${message.to}`, `Reply-To: ${message.replyTo}`,
    `Subject: ${subject}`,
    `Message-ID: <${messageId}@${CONTACT_EMAIL.split("@")[1]}>`, `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0", "Auto-Submitted: auto-generated", "X-Auto-Response-Suppress: All",
    `Content-Type: multipart/alternative; boundary="${boundary}"`, "",
    `--${boundary}`, 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", encoded(message.text),
    `--${boundary}`, 'Content-Type: text/html; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", encoded(message.html), `--${boundary}--`, "",
  ].join("\r\n");
  return Buffer.from(raw).toString("base64url");
}
