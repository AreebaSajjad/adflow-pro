import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";
const supabaseAdmin = getSupabaseAdmin();
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });

    const { data: user, error } = await supabaseAdmin
      .from("users").select("*").eq("email", email).single();

    if (error || !user)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    if (user.status === "suspended" || user.status === "banned")
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });

    const token = await signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: user.id, action_type: "user_login",
      target_type: "users", target_id: user.id,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
    res.cookies.set({
  name: "adflow_token",
  value: token,
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed." }, { status: 500 });
  }
}
