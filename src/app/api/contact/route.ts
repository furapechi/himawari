import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { validateContactPayload } from "@/lib/contact";
import { acceptContact, ContactRequestError } from "@/lib/accept-contact";
import { createReceipt, RECEIPT_COOKIE, RECEIPT_MAX_AGE } from "@/lib/contact-receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function receiptResponse(reference: string, receipt: string, status = 201) {
  const response = NextResponse.json({ ok: true, reference, redirect: "/contact/thanks" }, {
    status, headers: { "Cache-Control": "no-store" },
  });
  response.cookies.set(RECEIPT_COOKIE, receipt, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/contact/thanks", maxAge: RECEIPT_MAX_AGE,
  });
  return response;
}

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      throw new ContactRequestError("送信形式が正しくありません。", 415);
    }
    const origin = request.headers.get("origin");
    const allowed = [new URL(request.url).origin, process.env.NEXT_PUBLIC_SITE_URL, "https://himawari-web-production.up.railway.app"].filter(Boolean);
    if (origin && !allowed.includes(origin)) throw new ContactRequestError("このページからは送信できません。", 403);
    const reader = request.body?.getReader();
    if (!reader) throw new ContactRequestError("入力内容を確認してください。", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24_000) { await reader.cancel(); throw new ContactRequestError("入力内容が長すぎます。", 413); }
      chunks.push(value);
    }
    let payload: unknown;
    try { payload = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { throw new ContactRequestError("入力内容を確認してください。", 400); }
    const result = validateContactPayload(payload);
    if (!result.ok) throw new ContactRequestError(result.error, 400);
    if (result.isBot) return receiptResponse("HF-RECEIVED", createReceipt("HF-RECEIVED", false));
    const submissionKey = request.headers.get("idempotency-key") || randomUUID();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionKey)) {
      throw new ContactRequestError("ページを更新してから再度お試しください。", 400);
    }
    const salt = process.env.CONTACT_HASH_SALT;
    if (process.env.NODE_ENV === "production" && !salt) throw new Error("contact_salt_missing");
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const ipHash = createHash("sha256").update(`${salt || "local-only"}:${ip}`).digest("hex");
    const accepted = await acceptContact(result.data, submissionKey, ipHash, request.headers.get("user-agent") || "");
    return receiptResponse(accepted.reference, accepted.receipt, accepted.duplicate ? 200 : 201);
  } catch (error) {
    if (error instanceof ContactRequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    // Do not log form values, database error details, or credentials.
    console.error("Contact submission failed");
    return NextResponse.json(
      { error: "ただいま送信できません。恐れ入りますが、お電話でお問い合わせください。" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
