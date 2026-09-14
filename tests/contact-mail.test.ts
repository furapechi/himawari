import { afterEach, describe, expect, it, vi } from "vitest";
import { buildContactMessage, encodeMessage } from "../src/lib/contact-mail";
import { createReceipt, readReceipt, RECEIPT_MAX_AGE } from "../src/lib/contact-receipt";
import { validateContactPayload } from "../src/lib/contact";
import { isMailConfigured, sendGoogleMail } from "../src/lib/google-mail";
import { CONTACT_EMAIL } from "../src/lib/contact-config";

const input = { name: "テスト保護者", nameKana: "てすと", email: "parent@example.com", phone: "0412345678", inquiryType: "見学・体験について", childAge: "小学校低学年", schoolName: "テスト小学校", preferredContact: "メール", message: '<script>alert("個別相談内容")</script>', privacy: true };
const date = new Date("2026-09-15T00:00:00Z");
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("問い合わせメール", () => {
  it("施設宛ては指定窓口で、返信先はお客様、入力値はHTMLとして実行されない", () => {
    const mail = buildContactMessage("staff", input, "HF-000123", date);
    expect(mail.to).toBe(CONTACT_EMAIL);
    expect(mail.replyTo).toBe(input.email);
    for (const value of [input.name, input.schoolName, input.message, input.phone]) expect(mail.text).toContain(value);
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
  });
  it("自動返信は個別相談や学校名を再掲せず、返信可能・日程未確定・連絡目安を案内", () => {
    const mail = buildContactMessage("customer", input, "HF-000123", date);
    expect(mail.to).toBe(input.email);
    expect(mail.replyTo).toBe(CONTACT_EMAIL);
    for (const value of [input.name, input.message, input.schoolName, input.phone]) expect(mail.text).not.toContain(value);
    for (const value of ["HF-000123", "2〜3営業日", "ご予約は確定しておりません", "ご返信", CONTACT_EMAIL]) expect(mail.text).toContain(value);
  });
  it("日本語のMIMEはUTF-8、複数宛先注入を拒否、encoded-wordは75文字以内", () => {
    const mail = buildContactMessage("customer", input, "HF-000123", date);
    const raw = Buffer.from(encodeMessage(mail, "hf-123-customer"), "base64url").toString("utf8");
    expect(raw).toContain(`To: ${input.email}\r\n`);
    expect(raw).toContain(`Reply-To: ${CONTACT_EMAIL}`);
    expect(raw).toContain("Auto-Submitted: auto-generated");
    expect(raw).toContain("Content-Type: text/plain;");
    expect(raw).toContain("Content-Type: text/html;");
    for (const word of raw.match(/=\?UTF-8\?B\?[^?]+\?=/g) || []) expect(word.length).toBeLessThanOrEqual(75);
    expect(() => encodeMessage({ ...mail, to: "a@example.com,b@example.com" }, "hf-123-customer")).toThrow();
    expect(() => encodeMessage({ ...mail, replyTo: "a@example.com\r\nBcc: x@example.com" }, "hf-123-customer")).toThrow();
  });
});

describe("受付証明・入力検証", () => {
  it("署名済み受付は有効、改ざん・期限切れ・個人情報は不可", () => {
    vi.stubEnv("CONTACT_HASH_SALT", "test-only-secret");
    const now = 1000000;
    const token = createReceipt("HF-000123", true, now);
    expect(readReceipt(token, now + 1)).toEqual({ reference: "HF-000123", mailQueued: true });
    expect(readReceipt(token + "x", now)).toBeNull();
    expect(readReceipt(token, now + RECEIPT_MAX_AGE * 1000)).toBeNull();
    expect(readReceipt("garbage")).toBeNull();
    expect(readReceipt(createReceipt("arbitrary", true, now), now)).toBeNull();
    expect(Buffer.from(token.split(".")[0], "base64url").toString()).not.toContain("@");
  });
  it.each(["a@example.com,b@example.com", "a@example.com\r\nBcc:x@example.com", "a@-bad.com", "a@b..com"])("不正なメールアドレスを拒否: %s", (email) => {
    expect(validateContactPayload({ ...input, email }).ok).toBe(false);
  });
  it("正常な問い合わせを受け付け、ハニーポットを識別", () => {
    expect(validateContactPayload(input).ok).toBe(true);
    expect(validateContactPayload({ ...input, website: "spam" })).toMatchObject({ ok: true, isBot: true });
    expect(validateContactPayload({ ...input, privacy: false }).ok).toBe(false);
  });
});

function enableMail() {
  vi.stubEnv("CONTACT_MAIL_ENABLED", "true");
  vi.stubEnv("GOOGLE_MAIL_CLIENT_ID", "test-client");
  vi.stubEnv("GOOGLE_MAIL_CLIENT_SECRET", "test-secret");
  vi.stubEnv("GOOGLE_MAIL_REFRESH_TOKEN", "test-refresh");
}

describe("Gmail API配信（外部送信なし）", () => {
  const mail = buildContactMessage("customer", input, "HF-000123", date);
  it("未設定時には送信せず、秘密情報をブラウザへ出さない", async () => {
    vi.stubEnv("CONTACT_MAIL_ENABLED", "false");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(isMailConfigured()).toBe(false);
    await expect(sendGoogleMail(mail, "hf-123-customer")).rejects.toMatchObject({ code: "mail_not_configured" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("OAuth更新後にHTTPSで送信、Googleの受付IDを取得", async () => {
    enableMail();
    const fetch = vi.fn().mockResolvedValueOnce(Response.json({ access_token: "test-access" })).mockResolvedValueOnce(Response.json({ id: "google-id" }));
    vi.stubGlobal("fetch", fetch);
    await expect(sendGoogleMail(mail, "hf-123-customer")).resolves.toBe("google-id");
    expect(fetch.mock.calls[1][0]).toBe("https://gmail.googleapis.com/gmail/v1/users/me/messages/send");
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe("Bearer test-access");
  });
  it.each([[429, "retry"], [403, "failed"], [500, "uncertain"]])("送信HTTP%sは%sとして記録", async (status, kind) => {
    enableMail();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({ access_token: "test-access" })).mockResolvedValueOnce(new Response("", { status: Number(status) })));
    await expect(sendGoogleMail(mail, "hf-123-customer")).rejects.toMatchObject({ kind });
  });
  it("送信タイムアウトは自動再送せず要確認、認証通信失敗は安全に再試行", async () => {
    enableMail();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({ access_token: "test-access" })).mockRejectedValueOnce(new Error("timeout")));
    await expect(sendGoogleMail(mail, "hf-123-customer")).rejects.toMatchObject({ kind: "uncertain" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(sendGoogleMail(mail, "hf-123-customer")).rejects.toMatchObject({ kind: "retry" });
  });
});
