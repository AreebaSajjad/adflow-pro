"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Plus, CreditCard, Bell, Settings,
  LogOut, Shield, Users, BarChart3, Activity, CheckSquare,
  ChevronLeft, ChevronRight, Zap, User
} from "lucide-react";

const CLIENT_NAV = [
  { href: "/dashboard/client", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { href: "/dashboard/client/my-ads", icon: <FileText size={18} />, label: "My Ads" },
  { href: "/dashboard/client/create-ad", icon: <Plus size={18} />, label: "Post New Ad" },
  { href: "/dashboard/client/payments", icon: <CreditCard size={18} />, label: "Payments" },
  { href: "/dashboard/client/notifications", icon: <Bell size={18} />, label: "Notifications" },
];

const MOD_NAV = [
  { href: "/dashboard/moderator", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { href: "/dashboard/moderator/review", icon: <CheckSquare size={18} />, label: "Review Queue" },
  { href: "/dashboard/moderator/flagged", icon: <Shield size={18} />, label: "Flagged Ads" },
];

const ADMIN_NAV = [
  { href: "/dashboard/admin", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { href: "/dashboard/admin/payments", icon: <CreditCard size={18} />, label: "Payment Verification" },
  { href: "/dashboard/admin/analytics", icon: <BarChart3 size={18} />, label: "Analytics" },
  { href: "/dashboard/admin/users", icon: <Users size={18} />, label: "User Management" },
  { href: "/dashboard/admin/system", icon: <Activity size={18} />, label: "System Health" },
];

const ROLE_META: Record<string, { nav: typeof CLIENT_NAV; color: string; label: string }> = {
  client:     { nav: CLIENT_NAV, color: "#3b6ef0", label: "Client Portal" },
  moderator:  { nav: MOD_NAV,    color: "#8b5cf6", label: "Moderator Panel" },
  admin:      { nav: ADMIN_NAV,  color: "#f59e0b", label: "Admin Dashboard" },
  super_admin:{ nav: ADMIN_NAV,  color: "#ef4444", label: "Super Admin" },
};

interface SidebarProps { role: string; userName?: string; }

export default function DashboardSidebar({ role, userName = "User" }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const meta = ROLE_META[role] || ROLE_META.client;

  function logout() {
    localStorage.removeItem("adflow_user");
    window.location.href = "/login";
  }

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 flex-shrink-0"
      style={{
        width: collapsed ? "72px" : "240px",
        background: "#0d1220",
        borderRight: "1px solid rgba(59,110,240,0.15)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}>
          A
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">AdFlow Pro</p>
            <p className="text-xs" style={{ color: meta.color }}>{meta.label}</p>
          </div>
        )}
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.12)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: meta.color }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{userName}</p>
              <p className="text-slate-500 text-xs capitalize">{role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {meta.nav.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "nav-active" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              title={collapsed ? item.label : undefined}
            >
              <span className={isActive ? "text-blue-400" : ""}>{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 space-y-1" style={{ borderTop: "1px solid rgba(59,110,240,0.1)", paddingTop: "12px" }}>
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <Zap size={18} />
          {!collapsed && <span>View Site</span>}
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all z-10"
        style={{ background: "#0d1220", border: "1px solid rgba(59,110,240,0.25)" }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
