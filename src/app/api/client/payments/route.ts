import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";
const supabaseAdmin = getSupabaseAdmin();

// POST /api/client/payments — submit payment proof
export async function POST(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { ad_id, amount, method, transaction_ref, sender_name, screenshot_url } = body;

  if (!ad_id || !amount || !method || !transaction_ref)
    return NextResponse.json({ error: "Missing required payment fields." }, { status: 400 });

  // Check ad belongs to user and is in payment_pending state
  const { data: ad } = await supabaseAdmin.from("ads").select("*").eq("id", ad_id).eq("user_id", payload.id as string).single();
  if (!ad) return NextResponse.json({ error: "Ad not found." }, { status: 404 });
  if (ad.status !== "payment_pending")
    return NextResponse.json({ error: "Ad is not awaiting payment." }, { status: 400 });

  // Check for duplicate transaction ref
  const { data: dup } = await supabaseAdmin.from("payments").select("id").eq("transaction_ref", transaction_ref).single();
  if (dup) return NextResponse.json({ error: "Duplicate transaction reference." }, { status: 409 });

  const { data: payment, error } = await supabaseAdmin.from("payments").insert({
    ad_id, user_id: payload.id,
    amount: parseFloat(amount), method, transaction_ref,
    sender_name: sender_name || null,
    screenshot_url: screenshot_url || null,
    status: "pending",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update ad status
  await supabaseAdmin.from("ads").update({ status: "payment_submitted" }).eq("id", ad_id);
  await supabaseAdmin.from("ad_status_history").insert({
    ad_id, previous_status: "payment_pending",
    new_status: "payment_submitted", changed_by: payload.id as string,
    note: `Payment submitted via ${method}. Ref: ${transaction_ref}`,
  });

  await supabaseAdmin.from("notifications").insert({
    user_id: payload.id, title: "Payment Submitted",
    message: `Your payment of PKR ${amount} has been submitted for verification. You'll be notified once approved.`,
    type: "info",
  });

  return NextResponse.json({ success: true, payment }, { status: 201 });
}

// GET /api/client/payments — get own payments
export async function GET(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("payments").select("*, ads(title, status)")
    .eq("user_id", payload.id as string)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data });
}
