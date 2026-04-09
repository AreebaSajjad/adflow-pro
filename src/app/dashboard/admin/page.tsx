"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import {
  FileText, Users, CreditCard, CheckCircle, Clock, TrendingUp,
  XCircle, BarChart3, Activity, ArrowRight, RefreshCw, Shield,
  Eye, Zap, AlertTriangle
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published:        { label: "Live",            color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  under_review:     { label: "Under Review",    color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  payment_pending:  { label: "Awaiting Payment",color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  payment_submitted:{ label: "Payment Sent",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  rejected:         { label: "Rejected",        color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  draft:            { label: "Draft",           color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  expired:          { label: "Expired",         color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  submitted:        { label: "Submitted",       color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
};

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalAds: 0, activeAds: 0, pendingReview: 0, pendingPayment: 0,
    totalUsers: 0, totalRevenue: 0, approvalRate: 0, todayAds: 0,
  });
  const [recentAds, setRecentAds] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    if (u.role !== "admin" && u.role !== "super_admin") { window.location.href = "/dashboard/client"; return; }
    setUser(u);
    fetchData();
  }, []);

  async function fetchData() {
    setRefreshing(true);
    try {
      const [adsRes, usersRes, paymentsRes] = await Promise.all([
        supabase.from("ads").select("*, packages(price, name), categories(name)"),
        supabase.from("users").select("id, role, status, created_at"),
        supabase.from("payments").select("*, ads(title)").order("created_at", { ascending: false }).limit(5),
      ]);

      const ads = adsRes.data || [];
      const users = usersRes.data || [];
      const payments = paymentsRes.data || [];

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const totalRevenue = ads.filter(a => a.status === "published").reduce((sum: number, a: any) => sum + (a.packages?.price || 0), 0);
      const approvedCount = ads.filter(a => !["rejected", "draft"].includes(a.status)).length;
      const reviewedCount = ads.filter(a => a.status !== "draft").length;

      setStats({
        totalAds: ads.length,
        activeAds: ads.filter(a => a.status === "published").length,
        pendingReview: ads.filter(a => ["submitted", "under_review"].includes(a.status)).length,
        pendingPayment: ads.filter(a => ["payment_pending", "payment_submitted"].includes(a.status)).length,
        totalUsers: users.filter(u => u.role === "client").length,
        totalRevenue,
        approvalRate: reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 0,
        todayAds: ads.filter(a => new Date(a.created_at) >= today).length,
      });

      setRecentAds(ads.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8));
      setRecentPayments(payments);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function verifyPayment(paymentId: string, adId: string) {
    await supabase.from("payments").update({ status: "verified", verified_by: user.id, verified_at: new Date().toISOString() }).eq("id", paymentId);
    await supabase.from("ads").update({ status: "published", publish_at: new Date().toISOString() }).eq("id", adId);
    fetchData();
  }

  const STAT_CARDS = [
    { label: "Total Ads", value: stats.totalAds, icon: <FileText size={20} />, color: "#3b6ef0", trend: `+${stats.todayAds} today` },
    { label: "Live Ads", value: stats.activeAds, icon: <CheckCircle size={20} />, color: "#10b981", trend: `${stats.approvalRate}% approval rate` },
    { label: "Pending Review", value: stats.pendingReview, icon: <Clock size={20} />, color: "#f59e0b", trend: "Needs attention" },
    { label: "Total Revenue", value: `PKR ${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: "#8b5cf6", trend: "from verified ads" },
    { label: "Registered Users", value: stats.totalUsers, icon: <Users size={20} />, color: "#06b6d4", trend: "clients" },
    { label: "Awaiting Payment", value: stats.pendingPayment, icon: <CreditCard size={20} />, color: "#f97316", trend: "needs verification" },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role="admin" userName={user?.name} />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield size={22} className="text-amber-400" /> Admin Dashboard
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">Platform overview and management controls</p>
            </div>
            <button onClick={fetchData} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-outline">
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stat grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {STAT_CARDS.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.label}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                    {s.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{loading ? "—" : s.value}</p>
                <p className="text-xs text-slate-600">{s.trend}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Ads table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
                <h2 className="font-semibold text-white">Recent Submissions</h2>
                <Link href="/dashboard/admin/ads" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="shimmer h-10 rounded-xl" />)}</div>
                ) : (
                  <table className="w-full table-dark">
                    <thead><tr><th className="text-left">Ad</th><th className="text-left">Category</th><th>Status</th></tr></thead>
                    <tbody>
                      {recentAds.map(ad => {
                        const sc = STATUS_CONFIG[ad.status] || STATUS_CONFIG.draft;
                        return (
                          <tr key={ad.id}>
                            <td className="text-white text-xs font-medium max-w-xs">
                              <span className="truncate block" style={{ maxWidth: "160px" }}>{ad.title}</span>
                            </td>
                            <td className="text-slate-500 text-xs">{ad.categories?.name || "—"}</td>
                            <td className="text-center">
                              <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Payment queue */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
                <h2 className="font-semibold text-white flex items-center gap-2"><CreditCard size={16} className="text-amber-400" /> Payment Verification</h2>
                <Link href="/dashboard/admin/payments" className="text-xs text-blue-400 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
              </div>
              {recentPayments.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle size={32} className="text-emerald-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No pending payments</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(59,110,240,0.08)" }}>
                  {recentPayments.map(p => (
                    <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{p.ads?.title}</p>
                        <p className="text-slate-500 text-xs">PKR {p.amount?.toLocaleString()} · {p.method}</p>
                        <p className="text-slate-600 text-xs mt-0.5">Ref: {p.transaction_ref}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.status === "pending" ? (
                          <button onClick={() => verifyPayment(p.id, p.ad_id)} className="px-3 py-1.5 rounded-lg text-xs font-medium btn-primary">
                            Verify
                          </button>
                        ) : (
                          <span className="px-2 py-1 rounded-lg text-xs" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>Verified</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/dashboard/moderator/review", icon: <Eye size={18} />, title: "Review Queue", desc: `${stats.pendingReview} pending`, color: "#3b6ef0" },
              { href: "/dashboard/admin/payments", icon: <CreditCard size={18} />, title: "Payments", desc: `${stats.pendingPayment} to verify`, color: "#f59e0b" },
              { href: "/dashboard/admin/analytics", icon: <BarChart3 size={18} />, title: "Analytics", desc: "View metrics", color: "#8b5cf6" },
              { href: "/dashboard/admin/system", icon: <Activity size={18} />, title: "System Health", desc: "Check status", color: "#10b981" },
            ].map((a, i) => (
              <Link key={i} href={a.href} className="flex items-center gap-3 p-5 rounded-2xl transition-all hover:-translate-y-1 group" style={{ background: "rgba(20,27,45,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}18`, color: a.color }}>
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
