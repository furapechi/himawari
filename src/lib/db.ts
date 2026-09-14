import { Pool } from "pg";

declare global {
  var himawariDbPool: Pool | undefined;
  var himawariDbReady: Promise<void> | undefined;
}

export function getPool() {
  if (global.himawariDbPool) return global.himawariDbPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const useSsl = /rlwy\.net|railway\.app/i.test(connectionString);
  global.himawariDbPool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 7_000,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

  return global.himawariDbPool;
}

export async function ensureDatabase() {
  if (!global.himawariDbReady) {
    global.himawariDbReady = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          status TEXT NOT NULL DEFAULT 'new',
          name TEXT NOT NULL,
          name_kana TEXT,
          email TEXT NOT NULL,
          phone TEXT,
          inquiry_type TEXT NOT NULL,
          child_age TEXT,
          school_name TEXT,
          preferred_contact TEXT NOT NULL,
          message TEXT NOT NULL,
          privacy_accepted BOOLEAN NOT NULL DEFAULT TRUE,
          ip_hash TEXT NOT NULL,
          user_agent TEXT
        )
      `);
      await pool.query(`
        ALTER TABLE inquiries
        ADD COLUMN IF NOT EXISTS school_name TEXT
      `);
      await pool.query(`
        ALTER TABLE inquiries
        ADD COLUMN IF NOT EXISTS submission_key UUID,
        ADD COLUMN IF NOT EXISTS payload_hash TEXT,
        ADD COLUMN IF NOT EXISTS mail_queued BOOLEAN NOT NULL DEFAULT FALSE
      `);
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS inquiries_submission_key_idx
        ON inquiries (submission_key)
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contact_mail_outbox (
          id BIGSERIAL PRIMARY KEY,
          inquiry_id BIGINT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
          kind TEXT NOT NULL CHECK (kind IN ('staff', 'customer')),
          status TEXT NOT NULL DEFAULT 'pending'
            CHECK (status IN ('pending', 'processing', 'retry', 'sent', 'failed', 'uncertain')),
          attempts INTEGER NOT NULL DEFAULT 0,
          next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_attempt_at TIMESTAMPTZ,
          sent_at TIMESTAMPTZ,
          provider_id TEXT,
          error_code TEXT,
          UNIQUE (inquiry_id, kind)
        )
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS contact_mail_due_idx
        ON contact_mail_outbox (next_attempt_at) WHERE status IN ('pending', 'retry')
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS inquiries_created_at_idx
        ON inquiries (created_at DESC)
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS inquiries_ip_rate_idx
        ON inquiries (ip_hash, created_at DESC)
      `);
    })().catch((error) => {
      global.himawariDbReady = undefined;
      throw error;
    });
  }

  return global.himawariDbReady;
}
