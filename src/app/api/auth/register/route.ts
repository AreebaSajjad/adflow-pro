import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, city, displayName } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const { data: existing } = await supabaseAdmin.from("users").select("id").eq("email", email).single();
    if (existing) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

    const { data: user, error } = await supabaseAdmin.from("users").insert({
      name, email, password_hash: password, role: "client", status: "active",
    }).select().single();

    if (error) throw error;

    await supabaseAdmin.from("seller_profiles").insert({
      user_id: user.id, display_name: displayName || name, phone: phone || null, city: city || null,
    });

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: user.id, action_type: "user_registered",
      target_type: "users", target_id: user.id,
      new_value: { email, role: "client" },
    });

    const token = await signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.cookies.set("adflow_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Registration failed." }, { status: 500 });
  }
}
