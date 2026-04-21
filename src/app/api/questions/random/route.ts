import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
const supabaseAdmin = getSupabaseAdmin();
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("learning_questions").select("*").eq("is_active", true);
  if (error || !data?.length)
    return NextResponse.json({ error: "No questions found." }, { status: 404 });
  const random = data[Math.floor(Math.random() * data.length)];
  return NextResponse.json({ question: random });
}
