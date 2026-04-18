import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || !["admin", "super_admin"].includes(payload.role as string)) return null;
  return payload;
}

// GET /api/admin/payment-queue
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*, ads(title, user_id), users(name, email)")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data });
}
