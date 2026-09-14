import { PGlite } from "@electric-sql/pglite";
import type { Pool } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
const delivery = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("../src/lib/google-mail", async (original) => ({ ...await original<object>(), sendGoogleMail: delivery.send }));
import { ensureDatabase } from "../src/lib/db";
import { acceptContact } from "../src/lib/accept-contact";
import { dispatchContactMail } from "../src/lib/contact-mail-worker";
import { MailDeliveryError } from "../src/lib/google-mail";

let database: PGlite;
const input = { name: "ローカル検証", email: "parent@example.com", inquiryType: "その他", preferredContact: "メール", message: "ローカルDBの検証用で外部送信はしません。", privacy: true };
const key = "12345678-1234-4234-8234-123456789012";
beforeAll(async () => {
  database = new PGlite();
  const query = (sql: string, values?: unknown[]) => database.query(sql, values);
  global.himawariDbPool = { query, connect: async () => ({ query, release() {} }) } as unknown as Pool;
  global.himawariDbReady = undefined;
  await ensureDatabase();
}, 30_000);
beforeEach(async () => {
  vi.stubEnv("CONTACT_HASH_SALT", "local-test");
  vi.stubEnv("CONTACT_MAIL_ENABLED", "true");
  vi.stubEnv("GOOGLE_MAIL_CLIENT_ID", "test-client");
  vi.stubEnv("GOOGLE_MAIL_CLIENT_SECRET", "test-secret");
  vi.stubEnv("GOOGLE_MAIL_REFRESH_TOKEN", "test-refresh");
  await database.exec("TRUNCATE contact_mail_outbox, inquiries RESTART IDENTITY CASCADE");
  global.himawariMailBusy = false;
  delivery.send.mockReset().mockResolvedValue("google-test-id");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.unstubAllEnvs());
afterAll(async () => {
  await database?.close();
  global.himawariDbPool = undefined;
  global.himawariDbReady = undefined;
});

describe("実PostgreSQLエンジンでの保存・配信処理（メモリー上、Googleはモック）", () => {
  it("マイグレーション・保存・二重送信防止・2通の配信完了", async () => {
    const first = await acceptContact(input, key, "ip", "test");
    const duplicate = await acceptContact(input, key, "ip", "test");
    expect(first.reference).toBe("HF-000001");
    expect(duplicate.reference).toBe(first.reference);
    expect((await database.query("SELECT * FROM inquiries")).rows).toHaveLength(1);
    expect((await database.query("SELECT * FROM contact_mail_outbox")).rows).toHaveLength(2);
    await dispatchContactMail();
    expect(delivery.send).toHaveBeenCalledTimes(2);
    expect(delivery.send.mock.calls[0][0].to).toBe("info@himawari-fc.jp");
    expect(delivery.send.mock.calls[1][0].to).toBe("parent@example.com");
    expect((await database.query<{ status: string }>("SELECT status FROM contact_mail_outbox")).rows.map((row) => row.status)).toEqual(["sent", "sent"]);
    await dispatchContactMail();
    expect(delivery.send).toHaveBeenCalledTimes(2);
  });
  it("既知の一時エラーを保留して再試行し、成功した別メールは再送しない", async () => {
    await acceptContact(input, key, "ip", "test");
    delivery.send.mockRejectedValueOnce(new MailDeliveryError("gmail_send_429", "retry"));
    await dispatchContactMail();
    expect((await database.query<{ status: string }>("SELECT status FROM contact_mail_outbox ORDER BY id")).rows.map((row) => row.status)).toEqual(["retry", "sent"]);
    await database.exec("UPDATE contact_mail_outbox SET next_attempt_at=NOW() WHERE status='retry'");
    await dispatchContactMail();
    expect(delivery.send).toHaveBeenCalledTimes(3);
    expect((await database.query("SELECT * FROM contact_mail_outbox WHERE status='sent'")).rows).toHaveLength(2);
  });
  it("配信結果不明は自動再送しない", async () => {
    await acceptContact(input, key, "ip", "test");
    delivery.send.mockRejectedValueOnce(new MailDeliveryError("gmail_send_unknown", "uncertain"));
    await dispatchContactMail();
    await dispatchContactMail();
    expect(delivery.send).toHaveBeenCalledTimes(2);
    expect((await database.query("SELECT * FROM contact_mail_outbox WHERE status='uncertain'")).rows).toHaveLength(1);
  });
  it("サーバー中断で残った送信処理は要確認へ移し、勝手に再送しない", async () => {
    await acceptContact(input, key, "ip", "test");
    await database.exec("UPDATE contact_mail_outbox SET status='processing', last_attempt_at=NOW()-INTERVAL '6 minutes'");
    await dispatchContactMail();
    expect(delivery.send).not.toHaveBeenCalled();
    expect((await database.query("SELECT * FROM contact_mail_outbox WHERE status='uncertain'")).rows).toHaveLength(2);
  });
  it("DBの送信待ち保存失敗時に受付データも残らない", async () => {
    await database.exec("ALTER TABLE contact_mail_outbox ADD CONSTRAINT force_failure CHECK (inquiry_id < 0)");
    try {
      await expect(acceptContact(input, key, "ip", "test")).rejects.toThrow();
      expect((await database.query("SELECT * FROM inquiries")).rows).toHaveLength(0);
    } finally { await database.exec("ALTER TABLE contact_mail_outbox DROP CONSTRAINT force_failure"); }
  });
});
