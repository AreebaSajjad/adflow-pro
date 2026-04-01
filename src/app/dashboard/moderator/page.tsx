'use client'
import { useEffect, useState } from 'react'

export default function ModeratorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return }
      setUser(d.user)
      loadQueue()
    })
  }, [])

  function loadQueue() {
    fetch('/api/moderator/review-queue')
      .then(r => r.json())
      .then(d => { setAds(d.ads || []); setLoading(false) })
  }

  async function handleAction(adId: string, action: 'approve' | 'reject') {
    setActionLoading(adId + action)
    await fetch(`/api/moderator/ads/${adId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    })
    setActionLoading(null)
    setNote('')
    loadQueue()
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
          <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-800">Moderator</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Moderation Panel</h1>
        <p className="text-gray-400 mb-8">Review submitted ads for content quality.</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-500 text-sm">Pending Review</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">{ads.length}</p>
          </div>
        </div>

        {ads.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-gray-400">No ads in the review queue right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map(ad => (
              <div key={ad.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{ad.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      By {ad.users?.name} • {ad.categories?.name} • {ad.cities?.name} • {ad.packages?.name}
                    </p>
                  </div>
                  <span className="text-gray-500 text-xs">{new Date(ad.created_at).toLocaleDateString()}</span>
                </div>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{ad.description}</p>

                {ad.ad_media?.[0] && (
                  <div className="mb-4">
                    <img
                      src={ad.ad_media[0].thumbnail_url || ad.ad_media[0].original_url}
                      alt="Ad media"
                      className="w-32 h-24 object-cover rounded-lg border border-gray-700"
                      onError={(e: any) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add note (optional)"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleAction(ad.id, 'approve')}
                    disabled={actionLoading === ad.id + 'approve'}
                    className="bg-green-700 hover:bg-green-600 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {actionLoading === ad.id + 'approve' ? '...' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(ad.id, 'reject')}
                    disabled={actionLoading === ad.id + 'reject'}
                    className="bg-red-800 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {actionLoading === ad.id + 'reject' ? '...' : '✗ Reject'}
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