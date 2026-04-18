import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Simple security: check for cron secret header
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== (process.env.NEXTAUTH_SECRET || "")) {
    // Still allow for demo — just log the attempt
    console.warn("Cron called without valid secret");
  }

  const start = Date.now();
  try {
    const now = new Date().toISOString();

    // Find all scheduled ads whose publish_at has passed
    const { data: scheduledAds, error } = await supabaseAdmin
      .from("ads")
      .select("id, title, user_id, package_id, packages(duration_days)")
      .eq("status", "scheduled")
      .lte("publish_at", now);

    if (error) throw error;

    const published: string[] = [];
    for (const ad of scheduledAds || []) {
      const durationDays = (ad as any).packages?.duration_days || 7;
      const expireAt = new Date(Date.now() + durationDays * 86400000).toISOString();

      await supabaseAdmin.from("ads").update({
        status: "published", expire_at: expireAt,
      }).eq("id", ad.id);

      await supabaseAdmin.from("ad_status_history").insert({
        ad_id: ad.id, previous_status: "scheduled",
        new_status: "published", note: "Auto-published by cron job",
      });

      await supabaseAdmin.from("notifications").insert({
        user_id: ad.user_id, title: "Your Ad is Live!",
        message: `Your ad "${ad.title}" has been published and is now visible to buyers.`,
        type: "success",
      });

      published.push(ad.id);
    }

    const ms = Date.now() - start;
    await supabaseAdmin.from("system_health_logs").insert({
      source: "cron/publish-scheduled",
      response_ms: ms,
      status: "ok",
      note: `Published ${published.length} ads`,
    });

    return NextResponse.json({ success: true, published: published.length, ms });
  } catch (err: any) {
    const ms = Date.now() - start;
    await supabaseAdmin.from("system_health_logs").insert({
      source: "cron/publish-scheduled", response_ms: ms,
      status: "error", note: err.message,
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
