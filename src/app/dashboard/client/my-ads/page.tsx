"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Eye, Clock, CheckCircle, XCircle, CreditCard, Search, Filter } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft:             { label: "Draft",            color: "#94a3b8", bg: "rgba(100,116,139,0.1)",  border: "rgba(100,116,139,0.3)" },
  submitted:         { label: "Submitted",         color: "#818cf8", bg: "rgba(129,140,248,0.1)",  border: "rgba(129,140,248,0.3)" },
  under_review:      { label: "Under Review",      color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.3)"  },
  payment_pending:   { label: "Payment Required",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.3)"  },
  payment_submitted: { label: "Payment Sent",      color: "#fb923c", bg: "rgba(251,146,60,0.1)",   border: "rgba(251,146,60,0.3)"  },
  payment_verified:  { label: "Payment Verified",  color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.3)"  },
  scheduled:         { label: "Scheduled",         color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.3)" },
  published:         { label: "Live",              color: "#10b981", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.3)"  },
  expired:           { label: "Expired",           color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
  rejected:          { label: "Rejected",          color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.3)"   },
  archived:          { label: "Archived",          color: "#475569", bg: "rgba(71,85,105,0.1)",    border: "rgba(71,85,105,0.3)"   },
};

const FILTERS = [
  { value: "all", label: "All Ads" },
  { value: "published", label: "Live" },
  { value: "under_review", label: "In Review" },
  { value: "payment_pending", label: "Needs Payment" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

export default function MyAdsPage() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchAds(u.id);
  }, []);

  useEffect(() => {
    let result = ads;
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    if (search) result = result.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [ads, statusFilter, search]);

  async function fetchAds(userId: string) {
    setLoading(true);
    const { data } = await supabase
      .from("ads")
      .select("*, packages(*), categories(*), cities(*), ad_media(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setAds(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  const counts = ads.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role={user?.role || "client"} userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Ads</h1>
              <p className="text-slate-500 text-sm mt-0.5">{ads.length} total listings</p>
            </div>
            <Link href="/dashboard/client/create-ad" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm btn-primary">
              <Plus size={16} /> Post New Ad
            </Link>
          </div>
        </div>

        <div className="p-8">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Live", count: counts.published || 0, color: "#10b981" },
              { label: "In Review", count: (counts.submitted || 0) + (counts.under_review || 0), color: "#60a5fa" },
              { label: "Needs Payment", count: counts.payment_pending || 0, color: "#f59e0b" },
              { label: "Rejected", count: counts.rejected || 0, color: "#ef4444" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
              </div>
            ))}
          </div>

          {/* Filters + search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search your ads..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm input-dark" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === f.value ? "btn-primary" : "btn-outline"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ads list */}
          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ border: "1px dashed rgba(59,110,240,0.2)" }}>
              <FileText size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No ads found</p>
              <p className="text-slate-600 text-sm mt-1">Try a different filter or post a new ad</p>
              <Link href="/dashboard/client/create-ad" className="inline-block mt-5 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold">
                Post New Ad
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(ad => {
                const sc = STATUS_CONFIG[ad.status] || STATUS_CONFIG.draft;
                const thumb = ad.ad_media?.[0]?.thumbnail_url;
                const daysLeft = ad.expire_at ? Math.max(0, Math.ceil((new Date(ad.expire_at).getTime() - Date.now()) / 86400000)) : null;

                return (
                  <div key={ad.id} className="flex items-center gap-4 p-5 rounded-2xl transition-all"
                    style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.1)" }}>
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: "rgba(59,110,240,0.1)" }}>
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><FileText size={20} className="text-blue-500" /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{ad.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-slate-500 text-xs">{ad.categories?.name}</span>
                        <span className="text-slate-700 text-xs">·</span>
                        <span className="text-slate-500 text-xs">{ad.cities?.name}</span>
                        {ad.price && <><span className="text-slate-700 text-xs">·</span><span className="text-blue-400 text-xs font-medium">PKR {ad.price.toLocaleString()}</span></>}
                        {ad.packages && <><span className="text-slate-700 text-xs">·</span><span className="text-slate-500 text-xs">{ad.packages.name}</span></>}
                      </div>
                      {daysLeft !== null && ad.status === "published" && (
                        <p className="text-xs mt-1" style={{ color: daysLeft <= 3 ? "#f59e0b" : "#475569" }}>
                          <Clock size={10} className="inline mr-1" />{daysLeft} days remaining
                        </p>
                      )}
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {sc.label}
                      </span>
                      {ad.status === "payment_pending" && (
                        <Link href="/dashboard/client/payments" className="px-3 py-1.5 rounded-xl text-xs font-semibold btn-primary">
                          Pay Now
                        </Link>
                      )}
                      {ad.status === "published" && (
                        <Link href={`/ads/${ad.slug}`} className="p-2 rounded-lg text-slate-500 hover:text-blue-400 transition-colors btn-outline">
                          <Eye size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
