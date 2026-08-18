import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { validateContactPayload } from "@/lib/contact";
import { ensureDatabase, getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientHash(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const salt = process.env.CONTACT_HASH_SALT || "himawari-local-development";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "送信形式が正しくありません。" }, { status: 415 });
    }

    const payload = await request.json();
    const result = validateContactPayload(payload);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.isBot) {
      return NextResponse.json({ ok: true, reference: "HF-RECEIVED" });
    }

    await ensureDatabase();
    const pool = getPool();
    const ipHash = getClientHash(request);

    const rate = await pool.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM inquiries
       WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL '15 minutes'`,
      [ipHash],
    );
    if ((rate.rows[0]?.count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "短時間に複数回送信されています。しばらく時間をおいてお試しください。" },
        { status: 429 },
      );
    }

    const data = result.data;
    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO inquiries (
         name, name_kana, email, phone, inquiry_type, child_age, school_name,
         preferred_contact, message, privacy_accepted, ip_hash, user_agent
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, $11)
       RETURNING id::text`,
      [
        data.name,
        data.nameKana || null,
        data.email,
        data.phone || null,
        data.inquiryType,
        data.childAge || null,
        data.schoolName || null,
        data.preferredContact,
        data.message,
        ipHash,
        (request.headers.get("user-agent") || "").slice(0, 500) || null,
      ],
    );

    const id = inserted.rows[0]?.id || "received";
    return NextResponse.json(
      { ok: true, reference: `HF-${id.padStart(6, "0")}` },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Contact submission failed", error);
    return NextResponse.json(
      { error: "ただいま送信できません。恐れ入りますが、お電話でお問い合わせください。" },
      { status: 500 },
    );
  }
}
