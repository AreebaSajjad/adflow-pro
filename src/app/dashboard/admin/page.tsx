'use client'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return }
      setUser(d.user)
      loadPayments()
    })
  }, [])

  function loadPayments() {
    fetch('/api/admin/payment-queue')
      .then(r => r.json())
      .then(d => { setPayments(d.payments || []); setLoading(false) })
  }

  async function handlePayment(paymentId: string, action: 'verify' | 'reject') {
    setActionLoading(paymentId + action)
    await fetch(`/api/admin/payments/${paymentId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setActionLoading(null)
    loadPayments()
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-blue-400 font-bold text-lg">AdFlow Pro</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <span className="bg-red-900/50 text-red-300 text-xs px-2 py-1 rounded-full border border-red-800">Admin</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Verify payments and manage listings.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Pending Payments', value: payments.length, color: 'text-yellow-400' },
            { label: 'Verified Today', value: '—', color: 'text-green-400' },
            { label: 'Live Ads', value: '—', color: 'text-blue-400' },
            { label: 'Total Revenue', value: '—', color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-8">
          {[
            { label: 'Analytics', href: '/dashboard/admin/analytics' },
            { label: 'Manage Users', href: '/dashboard/admin/users' },
            { label: 'All Ads', href: '/dashboard/admin/ads' },
            { label: 'Health Check', href: '/api/health/db' },
          ].map(link => (
            <a key={link.label} href={link.href}
              className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm text-gray-300 transition">
              {link.label}
            </a>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">Payment Queue</h2>

        {payments.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-gray-400">No pending payments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map(payment => (
              <div key={payment.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{payment.ads?.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      By {payment.users?.name} ({payment.users?.email})
                    </p>
                  </div>
                  <span className="text-green-400 font-bold">PKR {Number(payment.amount).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Method</p>
                    <p className="text-white mt-1">{payment.method}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Transaction Ref</p>
                    <p className="text-white mt-1 font-mono text-xs">{payment.transaction_ref}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Sender</p>
                    <p className="text-white mt-1">{payment.sender_name}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Submitted</p>
                    <p className="text-white mt-1">{new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {payment.screenshot_url && (
                  <a href={payment.screenshot_url} target="_blank"
                    className="text-blue-400 hover:underline text-sm mb-4 inline-block">
                    View Screenshot →
                  </a>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handlePayment(payment.id, 'verify')}
                    disabled={actionLoading === payment.id + 'verify'}
                    className="bg-green-700 hover:bg-green-600 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {actionLoading === payment.id + 'verify' ? '...' : '✓ Verify & Publish'}
                  </button>
                  <button
                    onClick={() => handlePayment(payment.id, 'reject')}
                    disabled={actionLoading === payment.id + 'reject'}
                    className="bg-red-800 hover:bg-red-700 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {actionLoading === payment.id + 'reject' ? '...' : '✗ Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}