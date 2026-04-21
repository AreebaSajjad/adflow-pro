import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";
const supabaseAdmin = getSupabaseAdmin();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || !["admin", "super_admin"].includes(payload.role as string))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, note } = await req.json();
  if (!["verify", "reject"].includes(action))
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const { data: payment } = await supabaseAdmin.from("payments").select("*, ads(title, user_id)").eq("id", params.id).single();
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  const newPaymentStatus = action === "verify" ? "verified" : "rejected";
  await supabaseAdmin.from("payments").update({
    status: newPaymentStatus,
    verified_by: payload.id, verified_at: new Date().toISOString(),
    note: note || null,
  }).eq("id", params.id);

  if (action === "verify") {
    // Publish the ad
    await supabaseAdmin.from("ads").update({
      status: "published", publish_at: new Date().toISOString(),
    }).eq("id", payment.ad_id);

    await supabaseAdmin.from("ad_status_history").insert({
      ad_id: payment.ad_id, previous_status: "payment_submitted",
      new_status: "published", changed_by: payload.id as string,
      note: "Payment verified by admin. Ad published.",
    });

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: payload.id as string, action_type: "payment_verified",
      target_type: "payments", target_id: params.id,
      new_value: { status: "verified", ad_id: payment.ad_id },
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: payment.ads?.user_id,
      title: "Your Ad is Now Live!",
      message: `Payment verified! Your ad "${payment.ads?.title}" is now published and visible to buyers.`,
      type: "success",
    });
  } else {
    await supabaseAdmin.from("ads").update({ status: "payment_pending" }).eq("id", payment.ad_id);
    await supabaseAdmin.from("notifications").insert({
      user_id: payment.ads?.user_id,
      title: "Payment Rejected",
      message: `Your payment for "${payment.ads?.title}" was rejected. Reason: ${note || "Invalid payment details."}`,
      type: "error",
    });
  }

  return NextResponse.json({ success: true, status: newPaymentStatus });
}
