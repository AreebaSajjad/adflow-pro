"use client";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { CreditCard, CheckCircle, AlertCircle, Upload, Clock } from "lucide-react";

const PAYMENT_METHODS = ["JazzCash", "Easypaisa", "Bank Transfer", "HBL", "Meezan Bank", "UBL", "Other"];

const PAY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Under Verification", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  verified: { label: "Verified",           color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  rejected: { label: "Rejected",           color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
};

export default function PaymentsPage() {
  const [user, setUser] = useState<any>(null);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    ad_id: "", amount: "", method: "", transaction_ref: "", sender_name: "", screenshot_url: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchData();
  }, []);

  async function fetchData() {
  setLoading(true);
  try {
    const stored = localStorage.getItem("adflow_user");
    const token = stored ? JSON.parse(stored).token : null;
    if (!token) { window.location.href = "/login"; return; }

    const headers = { "Authorization": `Bearer ${token}` };

    const [adsRes, paymentsRes] = await Promise.all([
      fetch("/api/client/ads?status=payment_pending", { headers, credentials: "include" }),
      fetch("/api/client/payments", { headers, credentials: "include" }),
    ]);

    const adsJson = await adsRes.json();
    const paymentsJson = await paymentsRes.json();

    setPendingAds(adsJson.ads || []);
    setPayments(paymentsJson.payments || []);

    if (adsJson.ads?.length > 0) {
      const first = adsJson.ads[0];
      setForm(f => ({ ...f, ad_id: first.id, amount: first.packages?.price?.toString() || "" }));
    }
  } catch (e) {
    console.error("fetchData error:", e);
  }
  setLoading(false);
}

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.ad_id || !form.amount || !form.method || !form.transaction_ref)
      return setError("Please fill all required fields.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/client/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setSuccess("Payment proof submitted! Admin will verify within 24 hours.");
      setForm({ ad_id: "", amount: "", method: "", transaction_ref: "", sender_name: "", screenshot_url: "" });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role={user?.role || "client"} userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <h1 className="text-2xl font-bold text-white">Submit Payment</h1>
          <p className="text-slate-500 text-sm mt-0.5">Submit your payment proof to get your ad published</p>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <CreditCard size={16} className="text-blue-400" /> Payment Details
              </h2>
            </div>
            <div className="p-6">
              {success && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}>
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> {success}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />)}
                </div>
              ) : pendingAds.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle size={36} className="text-emerald-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No ads awaiting payment</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Ads appear here after moderator approval
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Select Ad *</label>
                    <select
                      value={form.ad_id}
                      onChange={e => {
                        const ad = pendingAds.find(a => a.id === e.target.value);
                        update("ad_id", e.target.value);
                        if (ad) update("amount", ad.packages?.price?.toString() || "");
                      }}
                      className="w-full px-4 py-3 rounded-xl text-sm input-dark cursor-pointer">
                      <option value="">Select ad to pay for</option>
                      {pendingAds.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.title} — PKR {a.packages?.price?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Amount (PKR) *</label>
                      <input type="number" value={form.amount} onChange={e => update("amount", e.target.value)}
                        placeholder="0.00" className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Payment Method *</label>
                      <select value={form.method} onChange={e => update("method", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm input-dark cursor-pointer">
                        <option value="">Select method</option>
                        {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Transaction Reference / ID *</label>
                    <input type="text" value={form.transaction_ref} onChange={e => update("transaction_ref", e.target.value)}
                      placeholder="e.g. TXN-123456789" className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Sender Name</label>
                    <input type="text" value={form.sender_name} onChange={e => update("sender_name", e.target.value)}
                      placeholder="Name on account" className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Screenshot URL (optional)</label>
                    <input type="url" value={form.screenshot_url} onChange={e => update("screenshot_url", e.target.value)}
                      placeholder="https://drive.google.com/..." className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                    <p className="text-slate-600 text-xs mt-1">Upload screenshot to Google Drive or Imgur and paste the link</p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: "rgba(59,110,240,0.06)", border: "1px solid rgba(59,110,240,0.15)" }}>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Send payment to: <span className="text-white font-medium">AdFlow Pro — JazzCash: 0300-1234567</span><br />
                      Include your transaction ID in the reference above. Admin will verify within 24 hours.
                    </p>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting
                      ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      : <><Upload size={16} /> Submit Payment Proof</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
              <h2 className="font-semibold text-white">Payment History</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-4">
                {Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center">
                <Clock size={32} className="text-slate-700 mx-auto mb-2" />
                <p className="text-slate-600 text-sm">No payment history yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(59,110,240,0.08)" }}>
                {payments.map(p => {
                  const ps = PAY_STATUS[p.status] || PAY_STATUS.pending;
                  return (
                    <div key={p.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{p.ads?.title}</p>
                          <p className="text-slate-500 text-xs mt-0.5">PKR {p.amount?.toLocaleString()} · {p.method}</p>
                          <p className="text-slate-600 text-xs mt-0.5">Ref: {p.transaction_ref}</p>
                          <p className="text-slate-700 text-xs mt-0.5">
                            {new Date(p.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0"
                          style={{ background: ps.bg, color: ps.color }}>
                          {ps.label}
                        </span>
                      </div>
                      {p.admin_note && (
                        <p className="text-slate-600 text-xs mt-2 italic">Note: {p.admin_note}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}