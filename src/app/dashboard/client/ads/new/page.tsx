'use client'
import { useEffect, useState } from 'react'

export default function NewAdPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    package_id: '',
    category_id: '',
    city_id: '',
    media_url: '',
  })

  useEffect(() => {
    fetch('/api/packages').then(r => r.json()).then(d => setPackages(d.packages || []))
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
    fetch('/api/cities').then(r => r.json()).then(d => setCities(d.cities || []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/client/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to submit ad')
      return
    }

    setSuccess(true)
    setTimeout(() => window.location.href = '/dashboard/client', 2000)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-white text-2xl font-semibold">Ad Submitted!</h2>
        <p className="text-gray-400 mt-2">Redirecting to dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-blue-400 font-bold text-lg">AdFlow Pro</a>
        <a href="/dashboard/client" className="text-gray-400 hover:text-white text-sm transition">← Back to Dashboard</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Post New Ad</h1>
        <p className="text-gray-400 mb-8">Fill in the details for your listing.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <div>
            <label htmlFor="title" className="text-gray-400 text-sm mb-1.5 block">Ad Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g. iPhone 14 Pro Max for sale"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="text-gray-400 text-sm mb-1.5 block">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 h-32 resize-none"
              placeholder="Describe your listing in detail..."
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="text-gray-400 text-sm mb-1.5 block">Price (PKR)</label>
            <input
              id="price"
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g. 50000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="text-gray-400 text-sm mb-1.5 block">Category</label>
              <select
                id="category"
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="text-gray-400 text-sm mb-1.5 block">City</label>
              <select
                id="city"
                value={form.city_id}
                onChange={e => setForm({ ...form, city_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select city</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="package" className="text-gray-400 text-sm mb-1.5 block">Package</label>
            <select
              id="package"
              value={form.package_id}
              onChange={e => setForm({ ...form, package_id: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select package</option>
              {packages.map(p => <option key={p.id} value={p.id}>{p.name} — PKR {Number(p.price).toLocaleString()} ({p.duration_days} days)</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="media" className="text-gray-400 text-sm mb-1.5 block">Image URL <span className="text-gray-600">(optional)</span></label>
            <input
              id="media"
              type="url"
              value={form.media_url}
              onChange={e => setForm({ ...form, media_url: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/image.jpg or YouTube URL"
            />
            {form.media_url && (
              <p className="text-gray-500 text-xs mt-1">
                {form.media_url.includes('youtube') ? '🎥 YouTube video detected' : '🖼️ Image URL detected'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition"
          >
            {loading ? 'Submitting...' : 'Submit Ad for Review'}
          </button>
        </form>
      </div>
    </div>
  )
}