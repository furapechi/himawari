import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ accept: vi.fn() }));
vi.mock("../src/lib/accept-contact", async (importOriginal) => ({ ...await importOriginal<object>(), acceptContact: mocks.accept }));
import { POST } from "../src/app/api/contact/route";

const input = { name: "テスト保護者", email: "parent@example.com", inquiryType: "見学・体験について", preferredContact: "メール", message: "見学について問い合わせるテストです。", privacy: true };
const request = (body: string, headers: Record<string, string> = {}) => new NextRequest("https://himawari-fc.jp/api/contact", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body });
beforeEach(() => { vi.stubEnv("CONTACT_HASH_SALT", "test-secret"); mocks.accept.mockReset(); });
afterEach(() => vi.unstubAllEnvs());

describe("問い合わせAPI", () => {
  it("保存成功後だけ署名Cookieとサンキューページを返す", async () => {
    mocks.accept.mockResolvedValue({ reference: "HF-000123", receipt: "signed-test", duplicate: false });
    const response = await POST(request(JSON.stringify(input)));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, reference: "HF-000123", redirect: "/contact/thanks" });
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("Path=/contact/thanks");
    expect(response.headers.get("set-cookie")).not.toContain("parent@example.com");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it.each([["{broken", 400], ["{}", 400], ["x".repeat(25000), 413]])("不正JSON・未入力・巨大入力を保存前に拒否", async (body, status) => {
    const response = await POST(request(String(body)));
    expect(response.status).toBe(status);
    expect(mocks.accept).not.toHaveBeenCalled();
  });
  it("別サイトからの送信・不正な再送キーを拒否", async () => {
    expect((await POST(request(JSON.stringify(input), { Origin: "https://attacker.example" }))).status).toBe(403);
    expect((await POST(request(JSON.stringify(input), { "Idempotency-Key": "wrong" }))).status).toBe(400);
    expect(mocks.accept).not.toHaveBeenCalled();
  });
  it("ハニーポットでは通知も保存もしない", async () => {
    const response = await POST(request(JSON.stringify({ ...input, website: "spam" })));
    expect(response.status).toBe(201);
    expect(mocks.accept).not.toHaveBeenCalled();
  });
  it("DB障害時に受付成功を返さない・入力内容をログに残さない", async () => {
    mocks.accept.mockRejectedValue(new Error("private-database-error"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(request(JSON.stringify(input)));
    expect(response.status).toBe(500);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(JSON.stringify(log.mock.calls)).not.toContain("private-database-error");
  });
});
