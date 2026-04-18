import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const { data: ad, error } = await supabaseAdmin
    .from("ads")
    .select("*, packages(*), categories(*), cities(*), ad_media(*)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (error || !ad) return NextResponse.json({ error: "Ad not found." }, { status: 404 });
  return NextResponse.json({ ad });
}
