"use client";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { TrendingUp, FileText, Users, CreditCard, BarChart3, PieChart, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";

interface AnalyticsData {
  listings: any; revenue: any; moderation: any;
  taxonomy: any; users: any; trends: any; payments: any;
}

function BarChart({ data, maxVal, color = "#3b6ef0" }: { data: { label: string; value: number }[]; maxVal: number; color?: string }) {
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-slate-400 text-xs w-24 flex-shrink-0 truncate">{d.label}</span>
          <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: "rgba(59,110,240,0.08)" }}>
            <div className="h-full rounded-lg transition-all duration-700 flex items-center px-2"
              style={{ width: maxVal > 0 ? `${(d.value / maxVal) * 100}%` : "0%", background: color, minWidth: d.value > 0 ? "24px" : "0" }}>
              <span className="text-white text-xs font-medium">{d.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-slate-400 text-xs">{label}</span>
          <span className="text-white text-xs font-medium">{value}%</span>
        </div>
        <div className="h-1.5 rounded-full mt-1" style={{ background: "rgba(59,110,240,0.08)" }}>
          <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    if (!["admin", "super_admin"].includes(u.role)) { window.location.href = "/dashboard/client"; return; }
    setUser(u);
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/analytics/summary");
      const json = await res.json();
      setData(json);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }

  const statCards = data ? [
    { label: "Total Listings", value: data.listings.totalAds, icon: <FileText size={20} />, color: "#3b6ef0", sub: `+${data.listings.thisMonthAds} this month`, trend: data.listings.thisMonthAds >= data.listings.lastMonthAds ? "up" : "down" },
    { label: "Live Ads", value: data.listings.activeAds, icon: <TrendingUp size={20} />, color: "#10b981", sub: `${data.moderation.approvalRate}% approval rate`, trend: "up" },
    { label: "Total Revenue", value: `PKR ${(data.revenue.totalRevenue || 0).toLocaleString()}`, icon: <CreditCard size={20} />, color: "#8b5cf6", sub: `PKR ${(data.revenue.thisMonthRevenue || 0).toLocaleString()} this month`, trend: data.revenue.thisMonthRevenue >= data.revenue.lastMonthRevenue ? "up" : "down" },
    { label: "Registered Users", value: data.users.totalUsers, icon: <Users size={20} />, color: "#06b6d4", sub: `+${data.users.newUsersThisMonth} this month`, trend: "up" },
  ] : [];

  const categoryData = data ? Object.entries(data.taxonomy.adsByCategory).map(([label, value]) => ({ label, value: value as number })).sort((a, b) => b.value - a.value).slice(0, 6) : [];
  const cityData = data ? Object.entries(data.taxonomy.adsByCity).map(([label, value]) => ({ label, value: value as number })).sort((a, b) => b.value - a.value) : [];
  const maxCat = Math.max(...categoryData.map(d => d.value), 1);
  const maxCity = Math.max(...cityData.map(d => d.value), 1);

  const pkgRevData = data ? Object.entries(data.revenue.revenueByPackage).map(([label, value]) => ({ label, value: value as number })) : [];
  const maxPkg = Math.max(...pkgRevData.map(d => d.value), 1);

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role="admin" userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 size={22} className="text-blue-400" /> Analytics</h1>
              <p className="text-slate-500 text-sm mt-0.5">Platform-wide performance metrics</p>
            </div>
            <button onClick={fetchAnalytics} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-outline">
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />) :
              statCards.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.label}</span>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
                  <div className="flex items-center gap-1">
                    {s.trend === "up" ? <ArrowUp size={11} className="text-emerald-400" /> : <ArrowDown size={11} className="text-red-400" />}
                    <p className="text-xs text-slate-600">{s.sub}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Monthly trend */}
          <div className="rounded-2xl p-6" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
            <h2 className="font-semibold text-white mb-6">Monthly Trend (Last 6 Months)</h2>
            {loading ? <div className="shimmer h-40 rounded-xl" /> : (
              <div className="flex items-end gap-3 h-40">
                {data?.trends.monthly.map((m: any, i: number) => {
                  const maxAds = Math.max(...(data?.trends.monthly.map((x: any) => x.ads) || [1]), 1);
                  const heightPct = maxAds > 0 ? (m.ads / maxAds) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-slate-600 text-xs">{m.ads}</span>
                      <div className="w-full rounded-t-lg transition-all duration-700 relative group" style={{ height: `${heightPct}%`, minHeight: "4px", background: i === 5 ? "#3b6ef0" : "rgba(59,110,240,0.3)" }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ background: "#1a2340" }}>
                          PKR {m.revenue.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ads by category */}
            <div className="rounded-2xl p-6" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              <h2 className="font-semibold text-white mb-5">Ads by Category</h2>
              {loading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="shimmer h-6 rounded-lg" />)}</div> :
                <BarChart data={categoryData} maxVal={maxCat} color="#3b6ef0" />}
            </div>

            {/* Ads by city */}
            <div className="rounded-2xl p-6" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              <h2 className="font-semibold text-white mb-5">Ads by City</h2>
              {loading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="shimmer h-6 rounded-lg" />)}</div> :
                <BarChart data={cityData} maxVal={maxCity} color="#8b5cf6" />}
            </div>

            {/* Moderation breakdown */}
            <div className="rounded-2xl p-6" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              <h2 className="font-semibold text-white mb-5">Moderation Stats</h2>
              {loading ? <div className="shimmer h-32 rounded-xl" /> : data && (
                <div className="space-y-4">
                  <DonutStat value={data.moderation.approvalRate} label="Approval Rate" color="#10b981" />
                  <DonutStat value={Math.round((data.listings.rejectedAds / Math.max(data.listings.totalAds, 1)) * 100)} label="Rejection Rate" color="#ef4444" />
                  <DonutStat value={Math.round((data.listings.pendingReview / Math.max(data.listings.totalAds, 1)) * 100)} label="Pending Review" color="#f59e0b" />
                  <DonutStat value={Math.round((data.listings.expiredAds / Math.max(data.listings.totalAds, 1)) * 100)} label="Expired" color="#64748b" />
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { label: "Approved", value: data.moderation.approved, color: "#10b981" },
                      { label: "Rejected", value: data.moderation.rejected, color: "#ef4444" },
                      { label: "Reviewed", value: data.moderation.reviewed, color: "#3b6ef0" },
                    ].map((s, i) => (
                      <div key={i} className="rounded-xl p-3 text-center" style={{ background: "rgba(59,110,240,0.06)" }}>
                        <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Revenue by package */}
            <div className="rounded-2xl p-6" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              <h2 className="font-semibold text-white mb-5">Revenue by Package</h2>
              {loading ? <div className="shimmer h-32 rounded-xl" /> : (
                <div className="space-y-4">
                  <BarChart data={pkgRevData.map(d => ({ label: d.label, value: d.value }))} maxVal={maxPkg} color="#f59e0b" />
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { label: "Total", value: `PKR ${(data?.revenue.totalRevenue || 0).toLocaleString()}`, color: "#3b6ef0" },
                      { label: "This Month", value: `PKR ${(data?.revenue.thisMonthRevenue || 0).toLocaleString()}`, color: "#10b981" },
                      { label: "Payments", value: data?.payments.verified || 0, color: "#8b5cf6" },
                    ].map((s, i) => (
                      <div key={i} className="rounded-xl p-3 text-center" style={{ background: "rgba(59,110,240,0.06)" }}>
                        <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
