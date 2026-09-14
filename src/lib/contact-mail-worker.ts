import { ensureDatabase, getPool } from "./db";
import { buildContactMessage, type MailKind } from "./contact-mail";
import { isMailConfigured, MailDeliveryError, sendGoogleMail } from "./google-mail";

type Job = {
  id: string; inquiry_id: string; kind: MailKind; attempts: number; created_at: Date;
  name: string; name_kana: string | null; email: string; phone: string | null;
  inquiry_type: string; child_age: string | null; school_name: string | null;
  preferred_contact: string; message: string;
};

declare global {
  var himawariMailWorker: ReturnType<typeof setTimeout> | undefined;
  var himawariMailBusy: boolean | undefined;
}

async function claimJob(): Promise<Job | undefined> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const lock = await client.query<{ locked: boolean }>("SELECT pg_try_advisory_xact_lock(hashtext('himawari-mail-claim')) AS locked");
    if (!lock.rows[0]?.locked) { await client.query("COMMIT"); return; }
    await client.query(`UPDATE contact_mail_outbox SET status='uncertain', error_code='worker_interrupted'
      WHERE status='processing' AND last_attempt_at < NOW() - INTERVAL '5 minutes'`);
    const limits = await client.query<{ hour_count: number; day_count: number }>(`
      SELECT COUNT(*) FILTER (WHERE last_attempt_at > NOW() - INTERVAL '1 hour')::int AS hour_count,
        COUNT(*)::int AS day_count FROM contact_mail_outbox WHERE last_attempt_at > NOW() - INTERVAL '24 hours'`);
    if (limits.rows[0].hour_count >= 100 || limits.rows[0].day_count >= 500) { await client.query("COMMIT"); return; }
    const result = await client.query<Job>(`
      SELECT m.id::text, m.inquiry_id::text, m.kind, m.attempts, i.created_at, i.name, i.name_kana, i.email,
        i.phone, i.inquiry_type, i.child_age, i.school_name, i.preferred_contact, i.message
      FROM contact_mail_outbox m JOIN inquiries i ON i.id=m.inquiry_id
      WHERE m.status IN ('pending','retry') AND m.next_attempt_at <= NOW() AND m.attempts < 5
      ORDER BY m.id FOR UPDATE OF m SKIP LOCKED LIMIT 1`);
    const job = result.rows[0];
    if (job) await client.query("UPDATE contact_mail_outbox SET status='processing', attempts=attempts+1, last_attempt_at=NOW() WHERE id=$1", [job.id]);
    await client.query("COMMIT");
    return job;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export async function dispatchContactMail() {
  if (!isMailConfigured() || global.himawariMailBusy) return;
  global.himawariMailBusy = true;
  try {
    await ensureDatabase();
    for (let i = 0; i < 4; i++) {
      const job = await claimJob();
      if (!job) break;
      try {
        const reference = `HF-${job.inquiry_id.padStart(6, "0")}`;
        const message = buildContactMessage(job.kind, {
          name: job.name, nameKana: job.name_kana || "", email: job.email, phone: job.phone || "",
          inquiryType: job.inquiry_type, childAge: job.child_age || "", schoolName: job.school_name || "",
          preferredContact: job.preferred_contact, message: job.message, privacy: true,
        }, reference, job.created_at);
        const providerId = await sendGoogleMail(message, `hf-${job.inquiry_id}-${job.kind}`);
        await getPool().query("UPDATE contact_mail_outbox SET status='sent', sent_at=NOW(), provider_id=$2, error_code=NULL WHERE id=$1", [job.id, providerId]);
      } catch (error) {
        const failure = error instanceof MailDeliveryError ? error : new MailDeliveryError("worker_send_unknown", "uncertain");
        const status = failure.kind === "retry" && job.attempts >= 4 ? "failed" : failure.kind;
        const delay = Math.min(3600, 60 * 2 ** job.attempts);
        await getPool().query(`UPDATE contact_mail_outbox SET status=$2, error_code=$3,
          next_attempt_at=NOW() + ($4 * INTERVAL '1 second') WHERE id=$1`, [job.id, status, failure.code, delay]);
        console.error("Contact mail delivery needs attention", { job: job.id, status, code: failure.code });
      }
    }
  } catch {
    console.error("Contact mail worker unavailable");
  } finally { global.himawariMailBusy = false; }
}

export function startContactMailWorker() {
  if (!isMailConfigured() || global.himawariMailWorker) return;
  // This worker needs Railway's long-lived Node server with application sleeping disabled.
  const tick = async () => {
    await dispatchContactMail();
    global.himawariMailWorker = setTimeout(tick, 30_000);
    global.himawariMailWorker.unref();
  };
  global.himawariMailWorker = setTimeout(tick, 1000);
  global.himawariMailWorker.unref();
}
