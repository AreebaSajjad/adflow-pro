"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Login failed."); return; }

    // ✅ token bhi save karo
    localStorage.setItem("adflow_user", JSON.stringify({ ...data.user, token: data.token }));

    const role = data.user.role;
    if (role === "admin" || role === "super_admin") window.location.href = "/dashboard/admin";
    else if (role === "moderator") window.location.href = "/dashboard/moderator";
    else window.location.href = "/dashboard/client";
  } catch (err) {
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-gradient grid-pattern">
      {/* Logo top */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)" }}>A</div>
          <span className="font-bold text-white">AdFlow <span className="gradient-text">Pro</span></span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8" style={{ background: "rgba(14,19,33,0.95)", border: "1px solid rgba(59,110,240,0.2)", backdropFilter: "blur(20px)" }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(59,110,240,0.15)" }}>
              <Zap size={28} className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your AdFlow Pro account</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm input-dark" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm input-dark" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <Link href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid rgba(59,110,240,0.1)" }}>
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one free</Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(59,110,240,0.06)", border: "1px solid rgba(59,110,240,0.12)" }}>
            <p className="text-xs text-slate-500 text-center mb-2">Demo accounts</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              {[["Client", "client@demo.com"], ["Mod", "mod@demo.com"], ["Admin", "admin@demo.com"]].map(([role, email]) => (
                <button key={role} onClick={() => { setEmail(email); setPassword("demo123"); }}
                  className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" style={{ background: "rgba(59,110,240,0.08)" }}>
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
