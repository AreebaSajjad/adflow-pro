"use client";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Play, Zap, Database, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface HealthLog { id: string; source: string; response_ms: number; status: string; note: string; checked_at: string; }

export default function SystemHealthPage() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState("");
  const [jobResults, setJobResults] = useState<Record<string, any>>({});

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [logsRes, healthRes] = await Promise.all([
      supabase.from("system_health_logs").select("*").order("checked_at", { ascending: false }).limit(20),
      fetch("/api/health/db"),
    ]);
    setLogs(logsRes.data as HealthLog[] || []);
    const healthData = await healthRes.json();
    setDbStatus(healthData);
    setLoading(false);
  }

  async function runCronJob(job: string) {
    setRunningJob(job);
    try {
      const res = await fetch(`/api/cron/${job}`, { method: "POST" });
      const data = await res.json();
      setJobResults(prev => ({ ...prev, [job]: data }));
      fetchData();
    } catch (e: any) {
      setJobResults(prev => ({ ...prev, [job]: { error: e.message } }));
    } finally {
      setRunningJob("");
    }
  }

  function StatusIcon({ status }: { status: string }) {
    if (status === "ok") return <CheckCircle size={16} className="text-emerald-400" />;
    if (status === "slow") return <AlertTriangle size={16} className="text-amber-400" />;
    return <XCircle size={16} className="text-red-400" />;
  }

  function statusColor(s: string) {
    return s === "ok" ? "#10b981" : s === "slow" ? "#f59e0b" : "#ef4444";
  }

  const recentBySource = logs.reduce((acc, log) => {
    if (!acc[log.source]) acc[log.source] = log;
    return acc;
  }, {} as Record<string, HealthLog>);

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role="admin" userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)", background: "rgba(13,18,32,0.8)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Activity size={22} className="text-emerald-400" /> System Health</h1>
              <p className="text-slate-500 text-sm mt-0.5">Monitor database, cron jobs, and platform operations</p>
            </div>
            <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-outline">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* DB Status card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: dbStatus?.status === "ok" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
                <Database size={22} style={{ color: dbStatus?.status === "ok" ? "#10b981" : "#ef4444" }} />
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Database</p>
                <p className="text-white font-bold capitalize">{dbStatus?.db || "Checking..."}</p>
                {dbStatus?.response_ms && <p className="text-slate-600 text-xs">{dbStatus.response_ms}ms response</p>}
              </div>
            </div>

            {Object.entries(recentBySource).slice(0, 2).map(([source, log]) => (
              <div key={source} className="stat-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${statusColor(log.status)}18` }}>
                  <StatusIcon status={log.status} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{source.split("/").pop()}</p>
                  <p className="text-white font-bold capitalize">{log.status}</p>
                  <p className="text-slate-600 text-xs">{log.response_ms}ms · {new Date(log.checked_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cron Jobs */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
              <h2 className="font-semibold text-white flex items-center gap-2"><Zap size={16} className="text-blue-400" /> Scheduled Jobs</h2>
              <p className="text-slate-500 text-xs mt-0.5">Run manually or configure Vercel cron in vercel.json</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "publish-scheduled", label: "Publish Scheduled Ads", desc: "Finds scheduled ads whose publish_at has passed and publishes them", icon: <Play size={16} />, color: "#10b981" },
                { id: "expire-ads", label: "Expire Outdated Ads", desc: "Marks published ads past their expire_at as expired and sends reminders", icon: <Clock size={16} />, color: "#f59e0b" },
              ].map(job => {
                const result = jobResults[job.id];
                return (
                  <div key={job.id} className="rounded-xl p-5" style={{ background: "rgba(59,110,240,0.05)", border: "1px solid rgba(59,110,240,0.12)" }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-white font-semibold text-sm">{job.label}</p>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{job.desc}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${job.color}18`, color: job.color }}>
                        {job.icon}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-slate-500 flex-1">POST /api/cron/{job.id}</code>
                      <button onClick={() => runCronJob(job.id)} disabled={runningJob === job.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium btn-primary disabled:opacity-60">
                        {runningJob === job.id ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                        Run Now
                      </button>
                    </div>
                    {result && (
                      <div className="mt-3 p-3 rounded-lg text-xs font-mono" style={{ background: result.error ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", color: result.error ? "#f87171" : "#34d399" }}>
                        {result.error ? `Error: ${result.error}` : JSON.stringify(result)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vercel cron config */}
            <div className="px-6 pb-6">
              <div className="rounded-xl p-4" style={{ background: "rgba(59,110,240,0.06)", border: "1px solid rgba(59,110,240,0.12)" }}>
                <p className="text-slate-400 text-xs mb-2 font-medium">Add to vercel.json for automatic scheduling:</p>
                <pre className="text-xs text-blue-300 overflow-x-auto">{`{
  "crons": [
    { "path": "/api/cron/publish-scheduled", "schedule": "0 * * * *" },
    { "path": "/api/cron/expire-ads", "schedule": "0 0 * * *" }
  ]
}`}</pre>
              </div>
            </div>
          </div>

          {/* Health logs table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,110,240,0.15)", background: "rgba(13,18,32,0.8)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
              <h2 className="font-semibold text-white">Recent Health Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-dark">
                <thead>
                  <tr>
                    <th className="text-left">Source</th>
                    <th className="text-center">Status</th>
                    <th className="text-right">Response</th>
                    <th className="text-left">Note</th>
                    <th className="text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5}><div className="shimmer h-8 rounded m-2" /></td></tr>
                  )) : logs.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-slate-600 py-8">No health logs yet. Run a cron job or check DB health.</td></tr>
                  ) : logs.map(log => (
                    <tr key={log.id}>
                      <td><code className="text-xs text-blue-400">{log.source}</code></td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: `${statusColor(log.status)}15`, color: statusColor(log.status) }}>
                          <StatusIcon status={log.status} /> {log.status}
                        </span>
                      </td>
                      <td className="text-right text-slate-400 text-xs">{log.response_ms}ms</td>
                      <td className="text-slate-500 text-xs max-w-xs truncate">{log.note || "—"}</td>
                      <td className="text-right text-slate-600 text-xs">{new Date(log.checked_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
