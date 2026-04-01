'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) router.push('/login')
        else setUser(d.user)
      })
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-blue-400 font-bold text-lg">AdFlow Pro</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">👤 {user.name}</span>
          <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-800">Client</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">My Dashboard</h1>
        <p className="text-gray-400 mb-8">Manage your ads and track their status.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Ads', value: '0', color: 'text-blue-400' },
            { label: 'Active', value: '0', color: 'text-green-400' },
            { label: 'Pending Review', value: '0', color: 'text-yellow-400' },
            { label: 'Expired', value: '0', color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <a href="/dashboard/client/ads/new" className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-medium transition">
            + Post New Ad
          </a>
          <a href="/dashboard/client/ads" className="border border-gray-700 hover:border-gray-500 px-5 py-2.5 rounded-lg text-sm text-gray-300 transition">
            View My Ads
          </a>
        </div>

        {/* Empty state */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-400">No ads yet. Post your first listing!</p>
          <a href="/dashboard/client/ads/new" className="mt-4 inline-block bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg text-sm transition">
            Post an Ad
          </a>
        </div>
      </div>
    </div>
  )
}