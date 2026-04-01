'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
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
          <span className="bg-red-900/50 text-red-300 text-xs px-2 py-1 rounded-full border border-red-800">Admin</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Verify payments, manage users, and oversee listings.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Users', value: '0', color: 'text-blue-400' },
            { label: 'Pending Payments', value: '0', color: 'text-yellow-400' },
            { label: 'Live Ads', value: '0', color: 'text-green-400' },
            { label: 'Revenue', value: 'PKR 0', color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Payment Queue', desc: 'Verify pending payment proofs', href: '/dashboard/admin/payments', color: 'border-yellow-800 hover:border-yellow-600' },
            { title: 'Manage Users', desc: 'View, suspend or change roles', href: '/dashboard/admin/users', color: 'border-blue-800 hover:border-blue-600' },
            { title: 'All Listings', desc: 'Publish, schedule or archive ads', href: '/dashboard/admin/ads', color: 'border-green-800 hover:border-green-600' },
          ].map(card => (
            <a key={card.title} href={card.href} className={`bg-gray-900 border ${card.color} rounded-xl p-6 transition`}>
              <h3 className="font-semibold text-white">{card.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{card.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}