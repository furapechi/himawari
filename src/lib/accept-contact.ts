import { createHash } from "crypto";
import type { ContactPayload } from "./contact";
import { ensureDatabase, getPool } from "./db";
import { isMailConfigured } from "./google-mail";
import { createReceipt } from "./contact-receipt";

export class ContactRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function acceptContact(data: ContactPayload, submissionKey: string, ipHash: string, userAgent: string) {
  await ensureDatabase();
  const client = await getPool().connect();
  const payloadHash = createHash("sha256").update(JSON.stringify(data)).digest("hex");
  try {
    await client.query("BEGIN");
    // Serialize duplicate requests and rate checks across all running replicas.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`submission:${submissionKey}`]);
    const existing = await client.query<{ id: string; payload_hash: string; mail_queued: boolean }>(
      "SELECT id::text, payload_hash, mail_queued FROM inquiries WHERE submission_key = $1", [submissionKey],
    );
    if (existing.rows[0]) {
      const row = existing.rows[0];
      if (row.payload_hash !== payloadHash) throw new ContactRequestError("入力内容が変更されています。ページを更新してから送信してください。", 409);
      const reference = `HF-${row.id.padStart(6, "0")}`;
      const receipt = createReceipt(reference, row.mail_queued);
      await client.query("COMMIT");
      return { reference, receipt, duplicate: true };
    }
    await client.query("SELECT pg_advisory_xact_lock(hashtext('contact-global-rate'))");
    const lockKeys = [`email:${data.email}`, `ip:${ipHash}`].sort();
    for (const key of lockKeys) await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
    const rate = await client.query<{ ip_count: number; email_count: number; total_count: number }>(`
      SELECT COUNT(*) FILTER (WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL '15 minutes')::int AS ip_count,
        COUNT(*) FILTER (WHERE email = $2)::int AS email_count, COUNT(*)::int AS total_count
      FROM inquiries WHERE created_at > NOW() - INTERVAL '1 hour'`, [ipHash, data.email]);
    const count = rate.rows[0];
    if (count.ip_count >= 3 || count.email_count >= 3 || count.total_count >= 50) {
      throw new ContactRequestError("短時間に複数回送信されています。しばらく時間をおいていただくか、お電話でお問い合わせください。", 429);
    }
    const mailQueued = isMailConfigured();
    const inserted = await client.query<{ id: string }>(`
      INSERT INTO inquiries (name, name_kana, email, phone, inquiry_type, child_age, school_name,
        preferred_contact, message, privacy_accepted, ip_hash, user_agent, submission_key, payload_hash, mail_queued)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,$10,$11,$12,$13,$14) RETURNING id::text`, [
      data.name, data.nameKana || null, data.email, data.phone || null, data.inquiryType,
      data.childAge || null, data.schoolName || null, data.preferredContact, data.message,
      ipHash, userAgent.slice(0, 500) || null, submissionKey, payloadHash, mailQueued,
    ]);
    const id = inserted.rows[0].id;
    if (mailQueued) await client.query(
      "INSERT INTO contact_mail_outbox (inquiry_id, kind) VALUES ($1, 'staff'), ($1, 'customer')", [id],
    );
    const reference = `HF-${id.padStart(6, "0")}`;
    const receipt = createReceipt(reference, mailQueued);
    await client.query("COMMIT");
    return { reference, receipt, duplicate: false };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
