import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
const supabaseAdmin = getSupabaseAdmin();

export async function GET() {
  const start = Date.now();
  try {
    const { data, error } = await supabaseAdmin
      .from("learning_questions").select("id").limit(1);

    const ms = Date.now() - start;
    const status = error ? "error" : ms > 2000 ? "slow" : "ok";

    await supabaseAdmin.from("system_health_logs").insert({
      source: "api/health/db", response_ms: ms, status,
      note: error ? error.message : `DB responded in ${ms}ms`,
    });

    return NextResponse.json({
      status, db: error ? "error" : "connected",
      response_ms: ms, timestamp: new Date().toISOString(),
    }, { status: error ? 500 : 200 });
  } catch (err: any) {
    const ms = Date.now() - start;
    return NextResponse.json({ status: "error", db: "unreachable", response_ms: ms, error: err.message }, { status: 500 });
  }
}
