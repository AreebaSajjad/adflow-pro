"use client";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import { Users, Search, Shield, UserCheck, UserX, RefreshCw } from "lucide-react";

const ROLE_STYLE: Record<string, { color: string; bg: string }> = {
  client:      { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  moderator:   { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  admin:       { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  super_admin: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  active:    { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  suspended: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  banned:    { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export default function AdminUsersPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updating, setUpdating] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== "all") result = result.filter(u => u.role === roleFilter);
    if (search) result = result.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [users, roleFilter, search]);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  async function updateUserStatus(userId: string, status: string) {
    setUpdating(userId);
    await supabase.from("users").update({ status }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    setUpdating("");
  }

  async function updateUserRole(userId: string, role: string) {
    setUpdating(userId);
    await supabase.from("users").update({ role }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    setUpdating("");
  }

  const stats = {
    total: users.length,
    clients: users.filter(u => u.role === "client").length,
    mods: users.filter(u => u.role === "moderator").length,
    active: users.filter(u => u.status === "active").length,
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role="admin" userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users size={22} className="text-blue-400" /> User Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage roles, status, and access control</p>
            </div>
            <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-outline">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: stats.total, color: "#3b6ef0" },
              { label: "Clients", value: stats.clients, color: "#60a5fa" },
              { label: "Moderators", value: stats.mods, color: "#a78bfa" },
              { label: "Active", value: stats.active, color: "#10b981" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm input-dark" />
            </div>
            <div className="flex gap-2">
              {["all", "client", "moderator", "admin"].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${roleFilter === r ? "btn-primary" : "btn-outline"}`}>{r}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
            <div className="overflow-x-auto">
              <table className="w-full table-dark">
                <thead>
                  <tr>
                    <th className="text-left">User</th>
                    <th className="text-center">Role</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Joined</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(6).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5}><div className="shimmer h-10 rounded-lg m-2" /></td></tr>
                  )) : filtered.map(u => {
                    const rs = ROLE_STYLE[u.role] || ROLE_STYLE.client;
                    const ss = STATUS_STYLE[u.status] || STATUS_STYLE.active;
                    const isSelf = u.id === user?.id;
                    return (
                      <tr key={u.id} className={isSelf ? "opacity-70" : ""}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: rs.color + "80" }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{u.name} {isSelf && <span className="text-xs text-slate-600">(you)</span>}</p>
                              <p className="text-slate-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          {isSelf ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize" style={{ background: rs.bg, color: rs.color }}>{u.role.replace("_", " ")}</span>
                          ) : (
                            <select value={u.role} onChange={e => updateUserRole(u.id, e.target.value)} disabled={updating === u.id}
                              className="px-2 py-1 rounded-lg text-xs input-dark cursor-pointer capitalize">
                              {["client", "moderator", "admin", "super_admin"].map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                            </select>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize" style={{ background: ss.bg, color: ss.color }}>{u.status}</span>
                        </td>
                        <td className="text-center text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="text-center">
                          {!isSelf && (
                            <div className="flex items-center justify-center gap-2">
                              {u.status === "active" ? (
                                <button onClick={() => updateUserStatus(u.id, "suspended")} disabled={updating === u.id}
                                  className="p-1.5 rounded-lg text-amber-500 hover:text-amber-400 transition-colors" title="Suspend">
                                  <UserX size={14} />
                                </button>
                              ) : (
                                <button onClick={() => updateUserStatus(u.id, "active")} disabled={updating === u.id}
                                  className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-400 transition-colors" title="Activate">
                                  <UserCheck size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
