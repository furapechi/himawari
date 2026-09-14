import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ query: vi.fn(), release: vi.fn(), connect: vi.fn(), ensure: vi.fn() }));
vi.mock("../src/lib/db", () => ({ ensureDatabase: db.ensure, getPool: () => ({ connect: db.connect }) }));
import { acceptContact } from "../src/lib/accept-contact";
const input = { name: "テスト保護者", email: "parent@example.com", inquiryType: "その他", preferredContact: "メール", message: "確認テストのお問い合わせです。", privacy: true };
const key = "12345678-1234-4234-8234-123456789012";
beforeEach(() => {
  vi.stubEnv("CONTACT_HASH_SALT", "test-secret");
  vi.stubEnv("CONTACT_MAIL_ENABLED", "true");
  vi.stubEnv("GOOGLE_MAIL_CLIENT_ID", "test-client");
  vi.stubEnv("GOOGLE_MAIL_CLIENT_SECRET", "test-secret");
  vi.stubEnv("GOOGLE_MAIL_REFRESH_TOKEN", "test-refresh");
  db.query.mockReset(); db.release.mockClear(); db.connect.mockResolvedValue({ query: db.query, release: db.release });
  db.query.mockImplementation(async (sql: string) => {
    if (sql.includes("ip_count")) return { rows: [{ ip_count: 0, email_count: 0, total_count: 0 }] };
    if (sql.includes("INSERT INTO inquiries")) return { rows: [{ id: "123" }] };
    return { rows: [] };
  });
});
afterEach(() => vi.unstubAllEnvs());

describe("問い合わせの原子的な保存", () => {
  it("問い合わせと2通の通知を同じトランザクションで保存後、受付を返す", async () => {
    const result = await acceptContact(input, key, "ip-hash", "test-agent");
    expect(result.reference).toBe("HF-000123");
    const sql = db.query.mock.calls.map(([query]) => query);
    expect(sql[0]).toBe("BEGIN");
    expect(sql.at(-1)).toBe("COMMIT");
    expect(sql.find((query) => query.includes("INSERT INTO contact_mail_outbox"))).toContain("($1, 'staff'), ($1, 'customer')");
    expect(db.release).toHaveBeenCalledOnce();
  });
  it("同じ送信キーは受付番号を再利用し、二重保存・二重通知しない", async () => {
    db.query.mockImplementation(async (sql: string) => ({ rows: sql.includes("WHERE submission_key") ? [{ id: "123", payload_hash: createHash("sha256").update(JSON.stringify(input)).digest("hex"), mail_queued: true }] : [] }));
    expect((await acceptContact(input, key, "ip-hash", "test-agent")).duplicate).toBe(true);
    expect(db.query.mock.calls.some(([query]) => query.includes("INSERT"))).toBe(false);
  });
  it("送信キーの使い回しで内容が変わった場合は409", async () => {
    db.query.mockImplementation(async (sql: string) => ({ rows: sql.includes("WHERE submission_key") ? [{ id: "123", payload_hash: "different", mail_queued: true }] : [] }));
    await expect(acceptContact(input, key, "ip-hash", "test-agent")).rejects.toMatchObject({ status: 409 });
    expect(db.query).toHaveBeenCalledWith("ROLLBACK");
  });
  it("outbox保存失敗時は問い合わせもロールバック", async () => {
    const normal = db.query.getMockImplementation()!;
    db.query.mockImplementation(async (...args: unknown[]) => { if (String(args[0]).includes("INSERT INTO contact_mail_outbox")) throw new Error("db_error"); return normal(...args); });
    await expect(acceptContact(input, key, "ip-hash", "test-agent")).rejects.toThrow();
    expect(db.query).toHaveBeenCalledWith("ROLLBACK");
    expect(db.query).not.toHaveBeenCalledWith("COMMIT");
  });
  it("同一アドレス宛ての連続自動返信を制限", async () => {
    const normal = db.query.getMockImplementation()!;
    db.query.mockImplementation(async (...args: unknown[]) => String(args[0]).includes("ip_count") ? { rows: [{ ip_count: 0, email_count: 3, total_count: 3 }] } : normal(...args));
    await expect(acceptContact(input, key, "ip-hash", "test-agent")).rejects.toMatchObject({ status: 429 });
    expect(db.query.mock.calls.some(([query]) => query.includes("INSERT"))).toBe(false);
  });
  it("メール未設定中は従来どおり保存のみで、後日の一斉送信は作らない", async () => {
    vi.stubEnv("CONTACT_MAIL_ENABLED", "false");
    await acceptContact(input, key, "ip-hash", "test-agent");
    expect(db.query.mock.calls.some(([query]) => query.includes("INSERT INTO contact_mail_outbox"))).toBe(false);
  });
});
