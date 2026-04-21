"use client";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import { Shield, RefreshCw, AlertTriangle, Eye } from "lucide-react";

export default function FlaggedAdsPage() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchFlagged();
  }, []);

  async function fetchFlagged() {
    setLoading(true);
    const { data } = await supabase
      .from("ads")
      .select("*, categories(*), cities(*), users(name, email)")
      .eq("status", "rejected")
      .order("created_at", { ascending: false });
    setAds(data || []);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role={user?.role || "moderator"} userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield size={22} className="text-red-400" /> Flagged & Rejected Ads
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Ads that were rejected during moderation</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => <div key={i} className="shimmer h-16 rounded-2xl" />)}
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ border: "1px dashed rgba(59,110,240,0.2)" }}>
              <Shield size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No flagged ads</p>
              <p className="text-slate-600 text-sm mt-1">All clear! No rejected listings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ads.map(ad => (
                <div key={ad.id} className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.1)" }}>
                    <AlertTriangle size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{ad.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      By {ad.users?.name} · {ad.categories?.name} · {ad.cities?.name}
                    </p>
                    <p className="text-slate-600 text-xs mt-0.5">
                      {new Date(ad.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                    Rejected
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
