import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
const supabaseAdmin = getSupabaseAdmin();

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("packages").select("*").eq("is_active", true).order("price");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ packages: data });
}
