import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
const supabaseAdmin = getSupabaseAdmin();
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: ad, error } = await supabaseAdmin
    .from("ads")
    .select("*, packages(*), categories(*), cities(*), ad_media(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !ad) return NextResponse.json({ error: "Ad not found." }, { status: 404 });
  return NextResponse.json({ ad });
}