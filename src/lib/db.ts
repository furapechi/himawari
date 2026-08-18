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
