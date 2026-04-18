import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

function getYoutubeThumbnail(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : url;
}

// GET /api/client/ads — list own ads
export async function GET(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("ads")
    .select("*, packages(*), categories(*), cities(*), ad_media(*)")
    .eq("user_id", payload.id as string)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data });
}

// POST /api/client/ads — create new ad
export async function POST(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, price, category_id, city_id, package_id, mediaUrl, mediaType } = body;

  if (!title || !description || !category_id || !city_id || !package_id)
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });

  // Get package for duration
  const { data: pkg } = await supabaseAdmin.from("packages").select("*").eq("id", package_id).single();
  const expireAt = pkg ? new Date(Date.now() + pkg.duration_days * 86400000).toISOString() : null;
  const rankScore = (pkg?.weight || 1) * 10;

  const { data: ad, error } = await supabaseAdmin.from("ads").insert({
    user_id: payload.id, package_id, category_id, city_id,
    title, slug: slugify(title), description,
    price: price ? parseFloat(price) : null,
    status: "submitted", rank_score: rankScore,
    expire_at: expireAt,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Add media
  if (mediaUrl && ad) {
    const thumbnail = mediaType === "youtube" ? getYoutubeThumbnail(mediaUrl) : mediaUrl;
    await supabaseAdmin.from("ad_media").insert({
      ad_id: ad.id, source_type: mediaType || "image",
      original_url: mediaUrl, thumbnail_url: thumbnail,
      validation_status: "pending",
    });
  }

  // Log status history
  await supabaseAdmin.from("ad_status_history").insert({
    ad_id: ad.id, previous_status: "draft",
    new_status: "submitted", changed_by: payload.id as string,
    note: "Ad submitted by client",
  });

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: payload.id as string, action_type: "ad_created",
    target_type: "ads", target_id: ad.id,
    new_value: { title, status: "submitted" },
  });

  // Notify user
  await supabaseAdmin.from("notifications").insert({
    user_id: payload.id, title: "Ad Submitted!",
    message: `Your ad "${title}" is under review. We'll notify you once approved.`,
    type: "success",
  });

  return NextResponse.json({ success: true, ad }, { status: 201 });
}
