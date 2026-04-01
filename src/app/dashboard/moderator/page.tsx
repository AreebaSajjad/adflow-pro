'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ModeratorDashboard() {
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
          <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-800">Moderator</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Moderation Panel</h1>
        <p className="text-gray-400 mb-8">Review submitted ads for content quality.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Pending Review', value: '0', color: 'text-yellow-400' },
            { label: 'Approved Today', value: '0', color: 'text-green-400' },
            { label: 'Rejected Today', value: '0', color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-gray-400">No ads in the review queue right now.</p>
        </div>
      </div>
    </div>
  )
}