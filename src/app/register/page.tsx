"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", city: "", displayName: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta", "Faisalabad", "Multan"];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      // Check if email already exists
      const { data: existing } = await supabase.from("users").select("id").eq("email", form.email).single();
      if (existing) { setError("An account with this email already exists."); return; }

      // Create user (in production, password should be hashed server-side)
      const { data: newUser, error: insertErr } = await supabase.from("users").insert({
        name: form.name, email: form.email,
        password_hash: form.password, // In production: bcrypt hash via API route
        role: "client", status: "active",
      }).select().single();

      if (insertErr) throw insertErr;

      // Create seller profile
      if (newUser) {
        await supabase.from("seller_profiles").insert({
          user_id: newUser.id, display_name: form.displayName || form.name,
          phone: form.phone, city: form.city,
        });
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center hero-gradient grid-pattern px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(16,185,129,0.15)" }}>
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Account Created!</h2>
        <p className="text-slate-400 mb-8">Welcome to AdFlow Pro. You can now login and start posting ads.</p>
        <Link href="/login" className="inline-block px-8 py-4 rounded-2xl font-bold btn-primary">Go to Login <ArrowRight size={16} className="inline ml-1" /></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 hero-gradient grid-pattern">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)" }}>A</div>
          <span className="font-bold text-white">AdFlow <span className="gradient-text">Pro</span></span>
        </Link>
      </div>

      <div className="w-full max-w-lg">
        <div className="rounded-3xl p-8" style={{ background: "rgba(14,19,33,0.95)", border: "1px solid rgba(59,110,240,0.2)", backdropFilter: "blur(20px)" }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
            <p className="text-slate-400 text-sm mt-1">Start posting ads in minutes</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input required type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Ahmed Khan"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm input-dark" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Display Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={form.displayName} onChange={e => update("displayName", e.target.value)} placeholder="Ahmed's Store"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm input-dark" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="ahmed@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm input-dark" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type={showPw ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm input-dark" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="0300 1234567"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm input-dark" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">City</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select value={form.city} onChange={e => update("city", e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl text-sm input-dark cursor-pointer appearance-none">
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
