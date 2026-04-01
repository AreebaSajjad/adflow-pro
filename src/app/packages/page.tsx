'use client'
import { useEffect, useState } from 'react'

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(d => setPackages(d.packages || []))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-blue-400 font-bold text-lg">AdFlow Pro</a>
        <div className="flex gap-4 text-sm">
          <a href="/explore" className="text-gray-400 hover:text-white transition">Explore</a>
          <a href="/login" className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg transition">Login</a>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Package</h1>
          <p className="text-gray-400">Select the best plan for your listing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <div key={pkg.id} className={`rounded-xl p-6 border ${i === 1 ? 'border-blue-500 bg-blue-950/40' : 'border-gray-800 bg-gray-900'}`}>
              {i === 1 && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full mb-3 inline-block">Most Popular</span>}
              <h3 className="text-xl font-bold">{pkg.name}</h3>
              <p className="text-blue-400 text-3xl font-bold mt-2">PKR {Number(pkg.price).toLocaleString()}</p>
              <p className="text-gray-500 text-sm mt-1">{pkg.duration_days} days listing</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> {pkg.weight}x visibility weight</li>
                <li className="flex items-center gap-2"><span className={pkg.homepage_visibility ? 'text-green-400' : 'text-red-400'}>{pkg.homepage_visibility ? '✓' : '✗'}</span> Homepage visibility</li>
                <li className="flex items-center gap-2"><span className={pkg.is_featured ? 'text-green-400' : 'text-red-400'}>{pkg.is_featured ? '✓' : '✗'}</span> Featured placement</li>
                {pkg.refresh_days && <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Auto refresh every {pkg.refresh_days} days</li>}
              </ul>
              <a href="/dashboard/client/ads/new" className={`mt-6 block text-center py-2 rounded-lg text-sm font-medium transition ${i === 1 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border border-gray-700 hover:border-gray-500 text-gray-300'}`}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}