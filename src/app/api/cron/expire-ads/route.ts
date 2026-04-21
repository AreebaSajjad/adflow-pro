import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
const supabaseAdmin = getSupabaseAdmin();

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const now = new Date().toISOString();

    // Find all published ads that have passed expire_at
    const { data: expiredAds, error } = await supabaseAdmin
      .from("ads")
      .select("id, title, user_id, expire_at")
      .eq("status", "published")
      .lt("expire_at", now);

    if (error) throw error;

    const expired: string[] = [];
    for (const ad of expiredAds || []) {
      await supabaseAdmin.from("ads").update({ status: "expired" }).eq("id", ad.id);

      await supabaseAdmin.from("ad_status_history").insert({
        ad_id: ad.id, previous_status: "published",
        new_status: "expired", note: "Auto-expired by cron job",
      });

      await supabaseAdmin.from("notifications").insert({
        user_id: ad.user_id, title: "Ad Expired",
        message: `Your ad "${ad.title}" has expired. Renew your package to keep it live.`,
        type: "warning",
      });

      expired.push(ad.id);
    }

    // Find ads expiring in next 48 hours — send reminders
    const in48h = new Date(Date.now() + 48 * 3600000).toISOString();
    const { data: expiringAds } = await supabaseAdmin
      .from("ads")
      .select("id, title, user_id, expire_at")
      .eq("status", "published")
      .gt("expire_at", now)
      .lte("expire_at", in48h);

    for (const ad of expiringAds || []) {
      await supabaseAdmin.from("notifications").insert({
        user_id: ad.user_id, title: "Ad Expiring Soon",
        message: `Your ad "${ad.title}" will expire in less than 48 hours. Renew to stay visible.`,
        type: "warning",
      });
    }

    const ms = Date.now() - start;
    await supabaseAdmin.from("system_health_logs").insert({
      source: "cron/expire-ads", response_ms: ms, status: "ok",
      note: `Expired ${expired.length} ads. Sent ${expiringAds?.length || 0} expiry reminders.`,
    });

    return NextResponse.json({ success: true, expired: expired.length, reminders: expiringAds?.length || 0, ms });
  } catch (err: any) {
    const ms = Date.now() - start;
    await supabaseAdmin.from("system_health_logs").insert({
      source: "cron/expire-ads", response_ms: ms, status: "error", note: err.message,
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
