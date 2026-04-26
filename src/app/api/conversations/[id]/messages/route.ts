import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";

const supabaseAdmin = getSupabaseAdmin();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("adflow_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", params.id)
    .single();

  if (!conv || (conv.buyer_id !== payload.id && conv.seller_id !== payload.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*, sender:users!messages_sender_id_fkey(id, name)")
    .eq("conversation_id", params.id)
    .order("created_at", { ascending: true });

  // Mark as read
  await supabaseAdmin
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", params.id)
    .neq("sender_id", payload.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("adflow_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", params.id)
    .single();

  if (!conv || (conv.buyer_id !== payload.id && conv.seller_id !== payload.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { content, message_type, payment_amount, payment_method, payment_account, media_url } = await req.json();

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      conversation_id: params.id,
      sender_id: payload.id,
      content,
      message_type: message_type || "text",
      payment_amount,
      payment_method,
      payment_account,
      media_url,
    })
    .select("*, sender:users!messages_sender_id_fkey(id, name)")
    .single();

  await supabaseAdmin
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}