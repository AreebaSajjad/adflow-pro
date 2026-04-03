'use client'
import { useEffect, useState } from 'react'

export default function PaymentPage() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    ad_id: '',
    amount: '',
    method: '',
    transaction_ref: '',
    sender_name: '',
    screenshot_url: '',
  })

  useEffect(() => {
    fetch('/api/client/ads')
      .then(r => r.json())
      .then(d => {
        const pending = (d.ads || []).filter((a: any) => a.status === 'payment_pending')
        setAds(pending)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/client/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to submit payment')
      return
    }

    setSuccess(true)
    setTimeout(() => window.location.href = '/dashboard/client', 2000)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">💰</p>
        <h2 className="text-white text-2xl font-semibold">Payment Submitted!</h2>
        <p className="text-gray-400 mt-2">Admin will verify shortly...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-blue-400 font-bold text-lg">AdFlow Pro</a>
        <a href="/dashboard/client" className="text-gray-400 hover:text-white text-sm">← Back</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Submit Payment Proof</h1>
        <p className="text-gray-400 mb-8">Provide your transaction details for verification.</p>

        {ads.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-gray-400">No ads waiting for payment right now.</p>
            <a href="/dashboard/client" className="mt-4 inline-block text-blue-400 hover:underline text-sm">
              Back to Dashboard
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="ad_id" className="text-gray-400 text-sm mb-1.5 block">Select Ad</label>
              <select
                id="ad_id"
                value={form.ad_id}
                onChange={e => setForm({ ...form, ad_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select your ad</option>
                {ads.map(a => (
                  <option key={a.id} value={a.id}>{a.title} — {a.packages?.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="text-gray-400 text-sm mb-1.5 block">Amount (PKR)</label>
                <input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 1200"
                  required
                />
              </div>
              <div>
                <label htmlFor="method" className="text-gray-400 text-sm mb-1.5 block">Payment Method</label>
                <select
                  id="method"
                  value={form.method}
                  onChange={e => setForm({ ...form, method: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select method</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="HBL Konnect">HBL Konnect</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="transaction_ref" className="text-gray-400 text-sm mb-1.5 block">Transaction Reference</label>
              <input
                id="transaction_ref"
                type="text"
                value={form.transaction_ref}
                onChange={e => setForm({ ...form, transaction_ref: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g. TXN123456789"
                required
              />
            </div>

            <div>
              <label htmlFor="sender_name" className="text-gray-400 text-sm mb-1.5 block">Sender Name</label>
              <input
                id="sender_name"
                type="text"
                value={form.sender_name}
                onChange={e => setForm({ ...form, sender_name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Name on your account"
                required
              />
            </div>

            <div>
              <label htmlFor="screenshot_url" className="text-gray-400 text-sm mb-1.5 block">
                Screenshot URL <span className="text-gray-600">(optional)</span>
              </label>
              <input
                id="screenshot_url"
                type="url"
                value={form.screenshot_url}
                onChange={e => setForm({ ...form, screenshot_url: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="https://imgur.com/screenshot.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Submitting...' : 'Submit Payment Proof'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}