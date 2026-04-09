"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase, Package } from "@/lib/supabase";
import { CheckCircle, Star, Zap, Shield, Clock, ArrowRight, Home, RefreshCw } from "lucide-react";

const PKG_FEATURES: Record<string, Array<{ icon: React.ReactNode; text: string }>> = {
  Basic: [
    { icon: <Clock size={14} />, text: "7 days active listing" },
    { icon: <Zap size={14} />, text: "1x visibility boost" },
    { icon: <Shield size={14} />, text: "Moderation reviewed" },
  ],
  Standard: [
    { icon: <Clock size={14} />, text: "15 days active listing" },
    { icon: <Zap size={14} />, text: "2x visibility boost" },
    { icon: <Home size={14} />, text: "Category page priority" },
    { icon: <Shield size={14} />, text: "Moderation reviewed" },
  ],
  Premium: [
    { icon: <Clock size={14} />, text: "30 days active listing" },
    { icon: <Zap size={14} />, text: "3x visibility boost" },
    { icon: <Home size={14} />, text: "Homepage featured slot" },
    { icon: <RefreshCw size={14} />, text: "Auto-refresh every 3 days" },
    { icon: <Star size={14} />, text: "Premium badge on listing" },
    { icon: <Shield size={14} />, text: "Priority moderation" },
  ],
};

const PKG_COLORS: Record<string, { border: string; gradient: string; badge: string }> = {
  Basic: { border: "rgba(100,116,139,0.3)", gradient: "rgba(20,27,45,0.8)", badge: "text-slate-400" },
  Standard: { border: "rgba(59,110,240,0.35)", gradient: "rgba(26,35,64,0.9)", badge: "text-blue-400" },
  Premium: { border: "rgba(59,110,240,0.6)", gradient: "linear-gradient(135deg, #1a2340, #1e2a4a)", badge: "text-amber-400" },
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("packages").select("*").eq("is_active", true).order("price").then(({ data }) => {
      if (data) setPackages(data as Package[]);
      setLoading(false);
    });
  }, []);

  const displayPackages = loading
    ? [{ id: "1", name: "Basic", price: 500, duration_days: 7, is_featured: false, weight: 1, homepage_visibility: false, refresh_days: null, is_active: true },
       { id: "2", name: "Standard", price: 1200, duration_days: 15, is_featured: false, weight: 2, homepage_visibility: true, refresh_days: null, is_active: true },
       { id: "3", name: "Premium", price: 2500, duration_days: 30, is_featured: true, weight: 3, homepage_visibility: true, refresh_days: 3, is_active: true }]
    : packages;

  return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="pt-28 pb-20">
        {/* Hero */}
        <div className="text-center mb-16 px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(59,110,240,0.12)", border: "1px solid rgba(59,110,240,0.3)", color: "#5f8ef5" }}>
            <Zap size={12} /> Transparent Pricing
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">Simple, Effective Packages</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Choose the plan that fits your needs. Upgrade anytime. Every listing is fully moderated.</p>
        </div>

        {/* Package cards */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayPackages.map((pkg) => {
              const colors = PKG_COLORS[pkg.name] || PKG_COLORS.Basic;
              const features = PKG_FEATURES[pkg.name] || [];
              const isPremium = pkg.name === "Premium";

              return (
                <div key={pkg.id} className={`rounded-3xl p-8 relative flex flex-col transition-all duration-300 hover:-translate-y-1 ${isPremium ? "glow-blue" : ""}`}
                  style={{ background: colors.gradient, border: `2px solid ${colors.border}` }}>
                  {isPremium && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5" style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)", color: "white" }}>
                      <Star size={10} fill="white" /> MOST POPULAR
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">{pkg.name}</h2>
                    <p className="text-slate-500 text-sm">{pkg.duration_days} days visibility</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.12)" }}>
                    <p className="text-5xl font-extrabold gradient-text">PKR {(pkg.price ?? 0).toLocaleString()}</p>
                    <p className="text-slate-500 text-sm mt-1">one-time payment</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-8">
                    {features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="text-blue-400 flex-shrink-0">{f.icon}</span>
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-xl p-3 text-center" style={{ background: "rgba(59,110,240,0.08)" }}>
                      <p className="text-lg font-bold text-white">{pkg.weight}x</p>
                      <p className="text-xs text-slate-500">Rank Boost</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: "rgba(59,110,240,0.08)" }}>
                      <p className="text-lg font-bold text-white">{pkg.duration_days}d</p>
                      <p className="text-xs text-slate-500">Duration</p>
                    </div>
                  </div>

                  <Link href="/register" className={`w-full py-4 rounded-2xl text-center font-bold text-base block transition-all ${isPremium ? "btn-primary" : "btn-outline"}`}>
                    Get {pkg.name} <ArrowRight size={16} className="inline ml-1" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="mt-16 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)" }}>
            <div className="p-6" style={{ background: "rgba(26,35,64,0.8)" }}>
              <h3 className="text-xl font-bold text-white">Feature Comparison</h3>
            </div>
            <table className="w-full table-dark">
              <thead>
                <tr>
                  <th className="text-left" style={{ width: "40%" }}>Feature</th>
                  <th className="text-center">Basic</th>
                  <th className="text-center">Standard</th>
                  <th className="text-center">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Duration", "7 days", "15 days", "30 days"],
                  ["Ranking Boost", "1x", "2x", "3x"],
                  ["Homepage Placement", "✗", "✓", "✓"],
                  ["Featured Badge", "✗", "✗", "✓"],
                  ["Auto-Refresh", "✗", "✗", "Every 3 days"],
                  ["Support Priority", "Standard", "Priority", "Premium"],
                ].map(([feature, basic, std, prem]) => (
                  <tr key={feature}>
                    <td className="text-slate-300 font-medium">{feature}</td>
                    <td className="text-center text-slate-400">{basic}</td>
                    <td className="text-center text-slate-300">{std}</td>
                    <td className="text-center text-blue-400 font-medium">{prem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
