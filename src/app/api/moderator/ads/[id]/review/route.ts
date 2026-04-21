import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";
const supabaseAdmin = getSupabaseAdmin();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || !["moderator", "admin", "super_admin"].includes(payload.role as string))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, note } = await req.json();
  if (!["approve", "reject"].includes(action))
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const { data: ad } = await supabaseAdmin.from("ads").select("*, users(id)").eq("id", params.id).single();
  if (!ad) return NextResponse.json({ error: "Ad not found." }, { status: 404 });

  const prevStatus = ad.status;
  const newStatus = action === "approve" ? "payment_pending" : "rejected";

  await supabaseAdmin.from("ads").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", params.id);

  await supabaseAdmin.from("ad_status_history").insert({
    ad_id: params.id, previous_status: prevStatus,
    new_status: newStatus, changed_by: payload.id as string, note: note || null,
  });

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: payload.id as string, action_type: `ad_${action}d`,
    target_type: "ads", target_id: params.id,
    old_value: { status: prevStatus }, new_value: { status: newStatus },
  });

  const notifMsg = action === "approve"
    ? `Your ad "${ad.title}" passed moderation! Please submit payment to publish it.`
    : `Your ad "${ad.title}" was rejected. Reason: ${note || "Does not meet guidelines."}`;

  await supabaseAdmin.from("notifications").insert({
    user_id: ad.user_id,
    title: action === "approve" ? "Ad Approved!" : "Ad Rejected",
    message: notifMsg,
    type: action === "approve" ? "success" : "error",
  });

  return NextResponse.json({ success: true, status: newStatus });
}
