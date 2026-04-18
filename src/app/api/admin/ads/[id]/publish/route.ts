import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || !["admin", "super_admin"].includes(payload.role as string))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, publish_at, admin_boost } = await req.json();

  const { data: ad } = await supabaseAdmin.from("ads").select("*, packages(duration_days)").eq("id", params.id).single();
  if (!ad) return NextResponse.json({ error: "Ad not found." }, { status: 404 });

  if (action === "publish") {
    const now = new Date();
    const expireAt = new Date(now.getTime() + (ad.packages?.duration_days || 7) * 86400000);
    await supabaseAdmin.from("ads").update({
      status: "published", publish_at: now.toISOString(),
      expire_at: expireAt.toISOString(), admin_boost: admin_boost || 0,
    }).eq("id", params.id);

    await supabaseAdmin.from("ad_status_history").insert({
      ad_id: params.id, previous_status: ad.status,
      new_status: "published", changed_by: payload.id as string, note: "Published by admin",
    });
  } else if (action === "schedule" && publish_at) {
    await supabaseAdmin.from("ads").update({ status: "scheduled", publish_at }).eq("id", params.id);
    await supabaseAdmin.from("ad_status_history").insert({
      ad_id: params.id, previous_status: ad.status,
      new_status: "scheduled", changed_by: payload.id as string,
      note: `Scheduled for ${publish_at}`,
    });
  }

  return NextResponse.json({ success: true });
}
