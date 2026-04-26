"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Bell, CheckCheck, CreditCard, ShieldCheck, XCircle, Clock, Info } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  payment_submitted: CreditCard,
  payment_approved: ShieldCheck,
  payment_rejected: XCircle,
  ad_approved:      ShieldCheck,
  ad_rejected:      XCircle,
  ad_expired:       Clock,
  default:          Info,
};

const COLOR_MAP: Record<string, { color: string; bg: string; border: string }> = {
  payment_submitted: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  payment_approved:  { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
  payment_rejected:  { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  ad_approved:       { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
  ad_rejected:       { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  ad_expired:        { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
  default:           { color: "#5f8ef5", bg: "rgba(59,110,240,0.08)",  border: "rgba(59,110,240,0.2)"  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.push("/login"); return; }
        loadNotifications();
      });
  }, []);

  async function loadNotifications() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  }

  async function markAllRead() {
    setMarkingAll(true);
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setMarkingAll(false);
  }

  async function markOneRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ background: "rgba(59,110,240,0.15)" }}>
              <Bell size={20} className="text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#3b6ef0" }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-slate-500 text-sm">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: "rgba(59,110,240,0.1)", border: "1px solid rgba(59,110,240,0.25)", color: "#5f8ef5" }}>
              <CheckCheck size={15} />
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="shimmer h-20 rounded-2xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24">
            <Bell size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 mb-1">No notifications yet</p>
            <p className="text-slate-600 text-sm">We'll notify you about your ads and payments here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const style = COLOR_MAP[n.type] || COLOR_MAP.default;
              const Icon = ICON_MAP[n.type] || ICON_MAP.default;
              return (
                <div
                  key={n.id}
                  onClick={() => { if (!n.is_read) markOneRead(n.id); }}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer"
                  style={{
                    background: n.is_read ? "rgba(13,18,32,0.6)" : style.bg,
                    border: `1px solid ${n.is_read ? "rgba(59,110,240,0.08)" : style.border}`,
                    opacity: n.is_read ? 0.7 : 1,
                  }}>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: n.is_read ? "rgba(59,110,240,0.06)" : style.bg, border: `1px solid ${style.border}` }}>
                    <Icon size={18} style={{ color: n.is_read ? "#475569" : style.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold" style={{ color: n.is_read ? "#94a3b8" : "#e2e8f0" }}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: style.color }} />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-slate-600 text-xs mt-2">
                      {new Date(n.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      {new Date(n.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}