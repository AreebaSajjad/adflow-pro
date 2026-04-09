"use client";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, Eye, MessageSquare, AlertTriangle, Filter, RefreshCw, ExternalLink } from "lucide-react";

export default function ModeratorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("submitted");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchAds();
  }, [filter]);

  async function fetchAds() {
    setLoading(true);
    const statuses = filter === "all" ? ["submitted", "under_review", "payment_pending", "payment_submitted", "published", "rejected"] : [filter];
    const { data } = await supabase.from("ads").select("*, packages(*), categories(*), cities(*), ad_media(*), users(name, email)").in("status", statuses).order("created_at", { ascending: false });

    const all = data || [];
    setAds(all);
    setStats({
      pending: all.filter((a: any) => ["submitted", "under_review"].includes(a.status)).length,
      approved: all.filter((a: any) => a.status === "payment_pending").length,
      rejected: all.filter((a: any) => a.status === "rejected").length,
      total: all.length,
    });
    setLoading(false);
  }

  async function handleAction(adId: string, action: "approve" | "reject") {
    if (!user) return;
    setActionLoading(true);
    const newStatus = action === "approve" ? "payment_pending" : "rejected";
    const prevStatus = selected?.status || "under_review";

    await supabase.from("ads").update({ status: newStatus }).eq("id", adId);
    await supabase.from("ad_status_history").insert({ ad_id: adId, previous_status: prevStatus, new_status: newStatus, changed_by: user.id, note: note || null });

    if (action === "approve") {
      await supabase.from("notifications").insert({ user_id: selected?.user_id, title: "Ad Approved!", message: `Your ad "${selected?.title}" has passed moderation. Please submit payment to publish.`, type: "success" });
    } else {
      await supabase.from("notifications").insert({ user_id: selected?.user_id, title: "Ad Rejected", message: `Your ad "${selected?.title}" was rejected. Reason: ${note || "Does not meet guidelines."}`, type: "error" });
    }

    setSelected(null);
    setNote("");
    fetchAds();
    setActionLoading(false);
  }

  const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
    submitted: { label: "Submitted", color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
    under_review: { label: "In Review", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    payment_pending: { label: "Approved", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role="moderator" userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Moderation Queue</h1>
              <p className="text-slate-500 text-sm mt-0.5">Review submitted ads for quality and policy compliance</p>
            </div>
            <button onClick={fetchAds} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-outline">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Pending Review", value: stats.pending, color: "#f59e0b" },
              { label: "Approved (→ Payment)", value: stats.approved, color: "#10b981" },
              { label: "Rejected", value: stats.rejected, color: "#ef4444" },
              { label: "Total Shown", value: stats.total, color: "#3b6ef0" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[["submitted", "New"], ["under_review", "In Review"], ["payment_pending", "Approved"], ["rejected", "Rejected"], ["all", "All"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? "btn-primary" : "btn-outline"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Two-pane layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Ads list */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              {loading ? (
                <div className="p-6 space-y-4">{Array(6).fill(0).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}</div>
              ) : ads.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle size={36} className="text-emerald-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Queue is clear!</p>
                  <p className="text-slate-600 text-sm">No ads in this filter.</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(59,110,240,0.08)" }}>
                  {ads.map(ad => {
                    const ss = STATUS_STYLE[ad.status] || STATUS_STYLE.submitted;
                    return (
                      <button key={ad.id} onClick={() => setSelected(ad)}
                        className={`w-full text-left px-5 py-4 transition-all ${selected?.id === ad.id ? "bg-blue-500/8" : "hover:bg-white/2"}`}
                        style={{ borderLeft: selected?.id === ad.id ? "3px solid #3b6ef0" : "3px solid transparent" }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{ad.title}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{ad.users?.name} · {ad.categories?.name}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium flex-shrink-0" style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1">{new Date(ad.created_at).toLocaleDateString()}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail pane */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              {!selected ? (
                <div className="flex flex-col items-center justify-center h-full py-24 text-center">
                  <Eye size={40} className="text-slate-700 mb-3" />
                  <p className="text-slate-500 font-medium">Select an ad to review</p>
                  <p className="text-slate-700 text-sm mt-1">Click any listing from the queue</p>
                </div>
              ) : (
                <div>
                  <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
                    <p className="text-white font-semibold">{selected.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Submitted by {selected.users?.name} ({selected.users?.email})</p>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Media preview */}
                    {selected.ad_media?.length > 0 && (
                      <div className="rounded-xl overflow-hidden" style={{ height: "160px" }}>
                        <img src={selected.ad_media[0].thumbnail_url || selected.ad_media[0].original_url} alt="Media"
                          className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Category", selected.categories?.name],
                        ["City", selected.cities?.name],
                        ["Package", selected.packages?.name],
                        ["Price", `PKR ${selected.price?.toLocaleString() || "N/A"}`],
                        ["Status", selected.status],
                        ["Submitted", new Date(selected.created_at).toLocaleDateString()],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl px-4 py-3" style={{ background: "rgba(59,110,240,0.06)" }}>
                          <p className="text-slate-500 text-xs mb-0.5">{k}</p>
                          <p className="text-white text-sm font-medium capitalize">{v || "—"}</p>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-slate-500 text-xs mb-2">Description</p>
                      <p className="text-slate-300 text-sm leading-relaxed rounded-xl p-4" style={{ background: "rgba(59,110,240,0.04)", border: "1px solid rgba(59,110,240,0.1)" }}>
                        {selected.description}
                      </p>
                    </div>

                    {/* Moderation note */}
                    {["submitted", "under_review"].includes(selected.status) && (
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Moderation Note (optional)</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the client..."
                          className="w-full px-4 py-3 rounded-xl text-sm input-dark resize-none" rows={3} />
                      </div>
                    )}

                    {/* Action buttons */}
                    {["submitted", "under_review"].includes(selected.status) && (
                      <div className="flex gap-3">
                        <button onClick={() => handleAction(selected.id, "approve")} disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm btn-primary disabled:opacity-60">
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button onClick={() => handleAction(selected.id, "reject")} disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
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
