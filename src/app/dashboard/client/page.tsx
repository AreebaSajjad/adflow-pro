"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import { Plus, FileText, Clock, CheckCircle, XCircle, TrendingUp, Bell, ArrowRight, AlertCircle, Eye } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:            { label: "Draft",           className: "badge-draft" },
  submitted:        { label: "Submitted",        className: "badge-review" },
  under_review:     { label: "Under Review",     className: "badge-review" },
  payment_pending:  { label: "Payment Pending",  className: "badge-pending" },
  payment_submitted:{ label: "Payment Sent",     className: "badge-pending" },
  payment_verified: { label: "Payment Verified", className: "badge-review" },
  scheduled:        { label: "Scheduled",        className: "badge-review" },
  published:        { label: "Live",             className: "badge-published" },
  expired:          { label: "Expired",          className: "badge-draft" },
  rejected:         { label: "Rejected",         className: "badge-rejected" },
  archived:         { label: "Archived",         className: "badge-draft" },
};

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchData(u.id);
  }, []);

  async function fetchData(userId: string) {
    setLoading(true);
    const [adsRes, notifRes] = await Promise.all([
      supabase.from("ads").select("*, packages(*), categories(*), cities(*)").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);
    const myAds = adsRes.data || [];
    setAds(myAds);
    setNotifications(notifRes.data || []);
    setStats({
      total: myAds.length,
      active: myAds.filter((a: any) => a.status === "published").length,
      pending: myAds.filter((a: any) => ["submitted", "under_review", "payment_pending", "payment_submitted", "payment_verified", "scheduled"].includes(a.status)).length,
      rejected: myAds.filter((a: any) => a.status === "rejected").length,
    });
    setLoading(false);
  }

  const statCards = [
    { label: "Total Ads", value: stats.total, icon: <FileText size={20} />, color: "#3b6ef0" },
    { label: "Live Ads", value: stats.active, icon: <CheckCircle size={20} />, color: "#10b981" },
    { label: "In Review", value: stats.pending, icon: <Clock size={20} />, color: "#f59e0b" },
    { label: "Rejected", value: stats.rejected, icon: <XCircle size={20} />, color: "#ef4444" },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role="client" userName={user?.name} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(" ")[0] || "User"} 👋</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage your listings and track their performance</p>
            </div>
            <Link href="/dashboard/client/create-ad" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm btn-primary">
              <Plus size={16} /> Post New Ad
            </Link>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.label}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                    {s.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{loading ? "—" : s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent ads */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
                <h2 className="font-semibold text-white">Recent Listings</h2>
                <Link href="/dashboard/client/my-ads" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
              </div>

              {loading ? (
                <div className="p-6 space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="shimmer w-12 h-12 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="shimmer h-4 rounded w-3/4" />
                        <div className="shimmer h-3 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ads.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={36} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No ads yet. Start posting!</p>
                  <Link href="/dashboard/client/create-ad" className="inline-block px-5 py-2.5 rounded-xl text-sm btn-primary font-semibold">Post Your First Ad</Link>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(59,110,240,0.08)" }}>
                  {ads.map(ad => {
                    const sc = STATUS_CONFIG[ad.status] || STATUS_CONFIG.draft;
                    return (
                      <div key={ad.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(59,110,240,0.12)" }}>
                          <FileText size={18} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{ad.title}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{ad.categories?.name} · {ad.cities?.name}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${sc.className}`}>{sc.label}</span>
                          <Link href={`/ads/${ad.slug}`} className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 transition-colors">
                            <Eye size={14} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
                <h2 className="font-semibold text-white flex items-center gap-2"><Bell size={16} className="text-blue-400" /> Notifications</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(59,110,240,0.2)", color: "#5f8ef5" }}>
                  {notifications.filter(n => !n.is_read).length} new
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={28} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(59,110,240,0.08)" }}>
                  {notifications.map(n => (
                    <div key={n.id} className={`px-5 py-4 ${!n.is_read ? "bg-blue-500/3" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? "bg-blue-400" : "bg-slate-700"}`} />
                        <div>
                          <p className="text-white text-xs font-medium">{n.title}</p>
                          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-slate-700 text-xs mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/dashboard/client/create-ad", icon: <Plus size={20} />, title: "Post New Ad", desc: "Create a new listing", color: "#3b6ef0" },
              { href: "/dashboard/client/payments", icon: <CreditCard size={20} />, title: "Submit Payment", desc: "Upload payment proof", color: "#10b981" },
              { href: "/explore", icon: <Eye size={20} />, title: "Browse Ads", desc: "See what's selling", color: "#8b5cf6" },
            ].map((a, i) => (
              <Link key={i} href={a.href} className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:-translate-y-1 group" style={{ background: "rgba(20,27,45,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: `${a.color}18`, color: a.color }}>
                  {a.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{a.title}</p>
                  <p className="text-slate-500 text-xs">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Fix missing import
function CreditCard(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
}
