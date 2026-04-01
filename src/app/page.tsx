export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-400">AdFlow Pro</span>
        <div className="flex gap-4 text-sm">
          <a href="/explore" className="text-gray-400 hover:text-white transition">Explore Ads</a>
          <a href="/packages" className="text-gray-400 hover:text-white transition">Packages</a>
          <a href="/login" className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg transition">Login</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <span className="bg-blue-900/40 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-800">
          Sponsored Listing Marketplace
        </span>
        <h1 className="mt-6 text-5xl font-bold leading-tight">
          Post. Get Reviewed.<br />
          <span className="text-blue-400">Go Live.</span>
        </h1>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto text-lg">
          AdFlow Pro is a moderated ads platform where your listing goes through
          a proper review and payment workflow before reaching real buyers.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/register" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-medium transition">
            Post an Ad
          </a>
          <a href="/explore" className="border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-xl text-gray-300 transition">
            Browse Listings
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-semibold mb-12 text-gray-200">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Post Your Ad", desc: "Fill in your listing details and select a package." },
            { step: "02", title: "Moderation", desc: "Our team reviews your content for quality and policy." },
            { step: "03", title: "Pay & Verify", desc: "Submit payment proof. Admin verifies it." },
            { step: "04", title: "Go Live", desc: "Your ad is published and visible to real buyers." },
          ].map((item) => (
            <div key={item.step} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <span className="text-blue-500 font-bold text-sm">{item.step}</span>
              <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-semibold mb-12 text-gray-200">Choose a Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Basic", price: "PKR 500", duration: "7 days", features: ["Standard listing", "Category placement", "1x visibility"] },
            { name: "Standard", price: "PKR 1,200", duration: "15 days", features: ["Category priority", "2x visibility", "Manual refresh"], highlight: true },
            { name: "Premium", price: "PKR 2,500", duration: "30 days", features: ["Homepage featured", "3x visibility", "Auto refresh every 3 days"] },
          ].map((pkg) => (
            <div key={pkg.name} className={`rounded-xl p-6 border ${pkg.highlight ? "border-blue-500 bg-blue-950/40" : "border-gray-800 bg-gray-900"}`}>
              {pkg.highlight && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full mb-3 inline-block">Most Popular</span>}
              <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
              <p className="text-blue-400 text-2xl font-semibold mt-1">{pkg.price}</p>
              <p className="text-gray-500 text-sm">{pkg.duration}</p>
              <ul className="mt-4 space-y-2">
                {pkg.features.map((f) => (
                  <li key={f} className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="/register" className={`mt-6 block text-center py-2 rounded-lg text-sm font-medium transition ${pkg.highlight ? "bg-blue-600 hover:bg-blue-500 text-white" : "border border-gray-700 hover:border-gray-500 text-gray-300"}`}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-semibold mb-12 text-gray-200">Platform Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { role: "Client", desc: "Post ads, track status, submit payments." },
            { role: "Moderator", desc: "Review ad content and flag violations." },
            { role: "Admin", desc: "Verify payments and publish listings." },
            { role: "Super Admin", desc: "Manage packages, users, and system." },
          ].map((r) => (
            <div key={r.role} className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <span className="text-blue-400 font-semibold">{r.role}</span>
              <p className="text-gray-500 text-sm mt-2">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        AdFlow Pro — Advanced Web Technologies Project · COMSATS University Islamabad
      </footer>

    </main>
  )
}