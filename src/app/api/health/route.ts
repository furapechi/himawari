import { NextResponse } from "next/server";
import { ensureDatabase, getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDatabase();
    await getPool().query("SELECT 1");
    return NextResponse.json(
      { status: "ok", service: "himawari-fc", database: "connected" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json(
      { status: "error", service: "himawari-fc", database: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
