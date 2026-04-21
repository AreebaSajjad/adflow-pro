import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getSupabaseAdmin } from "@/lib/supabase";
const supabaseAdmin = getSupabaseAdmin();

export async function GET(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token." }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from("users").select("id, name, email, role, status, created_at").eq("id", payload.id as string).single();

  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ user });
}
