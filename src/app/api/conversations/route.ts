import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";

const supabaseAdmin = getSupabaseAdmin();

export async function GET(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select(`
      *,
      ads(id, title, slug, price),
      buyer:users!conversations_buyer_id_fkey(id, name),
      seller:users!conversations_seller_id_fkey(id, name),
      messages(id, content, message_type, is_read, created_at, sender_id)
    `)
    .or(`buyer_id.eq.${payload.id},seller_id.eq.${payload.id}`)
    .order("last_message_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ad_id, seller_id } = await req.json();
  if (!ad_id || !seller_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (payload.id === seller_id) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  // Check existing conversation
  const { data: existing } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("ad_id", ad_id)
    .eq("buyer_id", payload.id)
    .single();

  if (existing) return NextResponse.json({ conversation: existing });

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({ ad_id, buyer_id: payload.id, seller_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversation: data });
}