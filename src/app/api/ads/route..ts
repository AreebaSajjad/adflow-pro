import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const sort = searchParams.get("sort") || "rank_score";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("ads")
    .select("*, packages(*), categories(*), cities(*), ad_media(*)", { count: "exact" })
    .eq("status", "published")
    .lte("expire_at", new Date(Date.now() + 999999999999).toISOString())
    .gte("expire_at", new Date().toISOString());

  if (q) query = query.ilike("title", `%${q}%`);

  if (category) {
    const { data: cat } = await supabaseAdmin.from("categories").select("id").eq("slug", category).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (city) {
    const { data: c } = await supabaseAdmin.from("cities").select("id").eq("slug", city).single();
    if (c) query = query.eq("city_id", c.id);
  }

  const validSorts = ["rank_score", "created_at", "price"];
  const sortCol = validSorts.includes(sort) ? sort : "rank_score";
  query = query.order(sortCol, { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ads: data, total: count, page, limit });
}
