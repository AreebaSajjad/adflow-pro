"use client";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";

const PAY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  verified: { label: "Verified", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export default function AdminPaymentsPage() {
  const [user, setUser] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    if (!["admin", "super_admin"].includes(u.role)) { window.location.href = "/"; return; }
    setUser(u);
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    const res = await fetch("/api/admin/payment-queue");
    const data = await res.json();
    setPayments(data.payments || []);
    setLoading(false);
  }

  async function handleAction(paymentId: string, action: "verify" | "reject") {
    setActionLoading(true); setMsg("");
    const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(action === "verify" ? "Payment verified! Ad is now live." : "Payment rejected.");
      setSelected(null); setNote("");
      fetchPayments();
    } else {
      setMsg(data.error || "Action failed.");
    }
    setActionLoading(false);
  }

  const filtered = payments.filter(p => filter === "all" || p.status === filter);
  const stats = { pending: payments.filter(p => p.status === "pending").length, verified: payments.filter(p => p.status === "verified").length, rejected: payments.filter(p => p.status === "rejected").length };

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role="admin" userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><CreditCard size={22} className="text-amber-400" /> Payment Verification</h1>
              <p className="text-slate-500 text-sm mt-0.5">Verify client payment submissions</p>
            </div>
            <button onClick={fetchPayments} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-outline">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Pending", value: stats.pending, color: "#f59e0b" },
              { label: "Verified", value: stats.verified, color: "#10b981" },
              { label: "Rejected", value: stats.rejected, color: "#ef4444" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {msg && (
            <div className="px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2" style={{ background: msg.includes("live") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: msg.includes("live") ? "#34d399" : "#f87171", border: `1px solid ${msg.includes("live") ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}` }}>
              {msg.includes("live") ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {msg}
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {["pending", "verified", "rejected", "all"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? "btn-primary" : "btn-outline"}`}>{f}</button>
            ))}
          </div>

          {/* Two-pane */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* List */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              {loading ? (
                <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center"><Clock size={32} className="text-slate-700 mx-auto mb-2" /><p className="text-slate-500 text-sm">No payments in this filter</p></div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(59,110,240,0.08)" }}>
                  {filtered.map(p => {
                    const ps = PAY_STATUS[p.status] || PAY_STATUS.pending;
                    return (
                      <button key={p.id} onClick={() => { setSelected(p); setNote(""); setMsg(""); }}
                        className={`w-full text-left px-5 py-4 transition-all ${selected?.id === p.id ? "bg-blue-500/8" : "hover:bg-white/2"}`}
                        style={{ borderLeft: selected?.id === p.id ? "3px solid #3b6ef0" : "3px solid transparent" }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{p.ads?.title}</p>
                            <p className="text-slate-500 text-xs mt-0.5">PKR {p.amount?.toLocaleString()} · {p.method}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium" style={{ background: ps.bg, color: ps.color }}>{ps.label}</span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1">{p.users?.name}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
              {!selected ? (
                <div className="flex flex-col items-center justify-center h-full py-24">
                  <CreditCard size={40} className="text-slate-700 mb-3" />
                  <p className="text-slate-500">Select a payment to review</p>
                </div>
              ) : (
                <div>
                  <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
                    <p className="text-white font-semibold">Payment Review</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Ad Title", selected.ads?.title],
                        ["Client", selected.users?.name],
                        ["Email", selected.users?.email],
                        ["Amount", `PKR ${selected.amount?.toLocaleString()}`],
                        ["Method", selected.method],
                        ["Transaction Ref", selected.transaction_ref],
                        ["Sender Name", selected.sender_name || "—"],
                        ["Submitted", new Date(selected.created_at).toLocaleDateString()],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl p-3" style={{ background: "rgba(59,110,240,0.06)" }}>
                          <p className="text-slate-500 text-xs mb-0.5">{k}</p>
                          <p className="text-white text-sm font-medium break-all">{v}</p>
                        </div>
                      ))}
                    </div>

                    {selected.screenshot_url && (
                      <a href={selected.screenshot_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm btn-outline w-full justify-center">
                        <ExternalLink size={14} /> View Screenshot
                      </a>
                    )}

                    {selected.status === "pending" && (
                      <>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Admin Note (optional)</label>
                          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the client..."
                            className="w-full px-4 py-3 rounded-xl text-sm input-dark resize-none" rows={2} />
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => handleAction(selected.id, "verify")} disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm btn-primary disabled:opacity-60">
                            <CheckCircle size={15} /> Verify & Publish
                          </button>
                          <button onClick={() => handleAction(selected.id, "reject")} disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-60"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                            <XCircle size={15} /> Reject
                          </button>
                        </div>
                      </>
                    )}
                    {selected.status !== "pending" && (
                      <div className="px-4 py-3 rounded-xl text-sm text-center" style={{ background: PAY_STATUS[selected.status]?.bg, color: PAY_STATUS[selected.status]?.color }}>
                        This payment has already been {selected.status}.
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
