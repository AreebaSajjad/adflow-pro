import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";
const supabaseAdmin = getSupabaseAdmin();
async function requireModerator(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return null;
  if (!["moderator", "admin", "super_admin"].includes(payload.role as string)) return null;
  return payload;
}

// GET /api/moderator/review-queue
export async function GET(req: NextRequest) {
  const user = await requireModerator(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "submitted";

  const statuses = status === "all"
    ? ["submitted", "under_review", "payment_pending", "rejected"]
    : [status];

  const { data, error } = await supabaseAdmin
    .from("ads")
    .select("*, packages(*), categories(*), cities(*), ad_media(*), users(name, email)")
    .in("status", statuses)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data });
}
