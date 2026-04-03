'use client'
import { useEffect, useState } from 'react'

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) { window.location.href = '/login'; return }
        setUser(d.user)
        return fetch('/api/client/ads')
      })
      .then(r => r?.json())
      .then(d => {
        setAds(d?.ads || [])
        setLoading(false)
      })
      .catch(() => { window.location.href = '/login' })
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const statusColor: Record<string, string> = {
    draft: 'text-gray-400',
    submitted: 'text-blue-400',
    under_review: 'text-yellow-400',
    payment_pending: 'text-orange-400',
    payment_submitted: 'text-purple-400',
    payment_verified: 'text-teal-400',
    scheduled: 'text-indigo-400',
    published: 'text-green-400',
    expired: 'text-red-400',
    rejected: 'text-red-500',
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  const active = ads.filter(a => a.status === 'published').length
  const pending = ads.filter(a => ['submitted', 'under_review', 'payment_pending', 'payment_submitted', 'payment_verified', 'scheduled'].includes(a.status)).length
  const expired = ads.filter(a => a.status === 'expired').length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-blue-400 font-bold text-lg">AdFlow Pro</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-800">Client</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-400 mb-8">Manage your ads and track their status.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Ads', value: ads.length, color: 'text-blue-400' },
            { label: 'Active', value: active, color: 'text-green-400' },
            { label: 'Pending', value: pending, color: 'text-yellow-400' },
            { label: 'Expired', value: expired, color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-8">
          <a href="/dashboard/client/ads/new" className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-medium transition">
            + Post New Ad
          </a>
        </div>

        {ads.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-400">No ads yet. Post your first listing!</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Title</th>
                  <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Category</th>
                  <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Package</th>
                  <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-4 text-white text-sm">{ad.title}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{ad.categories?.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{ad.packages?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`capitalize ${statusColor[ad.status] || 'text-gray-400'}`}>
                        {ad.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(ad.created_at).toLocaleDateString()}
                    </td>
                     <td className="px-6 py-4">
                       {ad.status === 'payment_pending' && (
    
                         < a href="/dashboard/client/payments"
                         className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1.5 rounded-lg text-xs font-medium        transition">
      Pay Now</a>
  )}
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}