"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdCard, { AdCardSkeleton } from "@/components/ads/AdCard";
import { supabase, Ad, Package, Category, LearningQuestion } from "@/lib/supabase";
import {
  Search, ArrowRight, Zap, Shield, Clock, TrendingUp,
  CheckCircle, Star, ChevronRight, Lightbulb, RotateCcw,
  Smartphone, Car, Home, Briefcase, Wrench, ShoppingBag, Dumbbell, Leaf,Tag
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  electronics: <Smartphone size={22} />, vehicles: <Car size={22} />,
  property: <Home size={22} />, jobs: <Briefcase size={22} />,
  services: <Wrench size={22} />, fashion: <ShoppingBag size={22} />,
  sports: <Dumbbell size={22} />, "home-garden": <Leaf size={22} />,
};

const TRUST_STATS = [
  { icon: <CheckCircle size={20} />, value: "12,400+", label: "Verified Listings" },
  { icon: <Shield size={20} />, value: "99.8%", label: "Safe Transactions" },
  { icon: <Zap size={20} />, value: "<24hrs", label: "Avg. Review Time" },
  { icon: <TrendingUp size={20} />, value: "8 Cities", label: "Across Pakistan" },
];

export default function HomePage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [question, setQuestion] = useState<LearningQuestion | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [adsRes, pkgRes, catRes, qRes] = await Promise.all([
        supabase.from("ads").select("*, packages(*), categories(*), cities(*), ad_media(*)").eq("status", "published").order("rank_score", { ascending: false }).limit(8),
        supabase.from("packages").select("*").eq("is_active", true).order("price"),
        supabase.from("categories").select("*").eq("is_active", true),
        supabase.from("learning_questions").select("*").eq("is_active", true).limit(1).order("id"),
      ]);
      if (adsRes.data) setAds(adsRes.data as Ad[]);
      if (pkgRes.data) setPackages(pkgRes.data as Package[]);
      if (catRes.data) setCategories(catRes.data as Category[]);
      if (qRes.data && qRes.data.length > 0) setQuestion(qRes.data[0] as LearningQuestion);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchNewQuestion() {
    setShowAnswer(false);
    const { data } = await supabase.from("learning_questions").select("*").eq("is_active", true);
    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      setQuestion(random as LearningQuestion);
    }
  }

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) window.location.href = `/explore?q=${encodeURIComponent(heroSearch)}`;
  };

  const pkgFeatures: Record<string, string[]> = {
    Basic: ["7 days visibility", "1x ranking boost", "Basic support"],
    Standard: ["15 days visibility", "2x ranking boost", "Homepage placement", "Priority support"],
    Premium: ["30 days visibility", "3x ranking boost", "Featured homepage", "Auto-refresh every 3 days", "Premium badge"],
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />

      {/* HERO */}
      <section className="relative pt-28 pb-20 overflow-hidden hero-gradient grid-pattern">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "#3b6ef0" }} />
          <div className="absolute bottom-10 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: "#a78bfa" }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(59,110,240,0.12)", border: "1px solid rgba(59,110,240,0.3)", color: "#5f8ef5" }}>
            <Zap size={12} /> Pakistan&apos;s #1 Moderated Ad Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Buy & Sell With<br /><span className="gradient-text">Full Confidence</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Every listing is reviewed by our moderation team. Only verified ads go live. No scams, no spam — just real deals.
          </p>
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-slate-500" />
              <input type="text" placeholder="Search electronics, cars, property..." value={heroSearch} onChange={e => setHeroSearch(e.target.value)}
                className="w-full pl-12 pr-36 py-4 rounded-2xl text-sm input-dark" style={{ background: "rgba(20,27,45,0.9)", border: "1px solid rgba(59,110,240,0.25)", fontSize: "15px" }} />
              <button type="submit" className="absolute right-2 px-6 py-2.5 rounded-xl text-sm font-semibold btn-primary">Search</button>
            </div>
          </form>
          <div className="flex flex-wrap justify-center gap-3">
            {["Electronics", "Vehicles", "Property", "Jobs", "Fashion"].map(cat => (
              <Link key={cat} href={`/explore?category=${cat.toLowerCase()}`}
                className="px-4 py-2 rounded-full text-xs text-slate-400 hover:text-blue-400 transition-all"
                style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.15)" }}>{cat}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <section className="py-10" style={{ background: "rgba(14,19,33,0.8)", borderTop: "1px solid rgba(59,110,240,0.1)", borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_STATS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0" style={{ background: "rgba(59,110,240,0.12)" }}>{s.icon}</div>
                <div><p className="text-xl font-bold text-white">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Browse Categories</h2>
            <p className="text-slate-500 text-sm mt-1">Find exactly what you&apos;re looking for</p>
          </div>
          <Link href="/categories" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            All categories <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {(loading ? Array(8).fill({ name: "...", slug: "loading" }) : categories).map((cat, i) => (
            <Link key={i} href={`/explore?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group"
              style={{ background: "rgba(20,27,45,0.6)", border: "1px solid rgba(59,110,240,0.1)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors" style={{ background: "rgba(59,110,240,0.12)" }}>
                {loading ? <div className="shimmer w-6 h-6 rounded" /> : (CATEGORY_ICONS[cat.slug] || <Tag size={22} />)}
              </div>
              {loading ? <div className="shimmer h-3 w-14 rounded" /> : (
                <span className="text-xs text-slate-400 group-hover:text-white text-center leading-tight transition-colors">{cat.name}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED ADS */}
      <section className="py-16" style={{ background: "rgba(12,16,26,0.6)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Featured Listings</h2>
              <p className="text-slate-500 text-sm mt-1">Top-ranked, verified ads — refreshed daily</p>
            </div>
            <Link href="/explore" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">View all <ArrowRight size={16} /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{Array(8).fill(0).map((_, i) => <AdCardSkeleton key={i} />)}</div>
          ) : ads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{ads.map(ad => <AdCard key={ad.id} ad={ad} />)}</div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(59,110,240,0.12)" }}><Search size={28} className="text-blue-500" /></div>
              <p className="text-slate-400 text-lg font-medium">No published ads yet</p>
              <p className="text-slate-600 text-sm mt-1">Be the first to post an ad!</p>
              <Link href="/register" className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold btn-primary">Post First Ad</Link>
            </div>
          )}
        </div>
      </section>

      {/* PACKAGES */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Choose Your Package</h2>
          <p className="text-slate-400">Simple pricing, maximum visibility</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(loading ? [{ name: "Basic", price: 500, duration_days: 7 }, { name: "Standard", price: 1200, duration_days: 15 }, { name: "Premium", price: 2500, duration_days: 30 }] : packages).map((pkg, i) => {
            const isPremium = pkg.name === "Premium";
            const features = pkgFeatures[pkg.name] || [];
            return (
              <div key={i} className={`rounded-2xl p-8 relative transition-all ${isPremium ? "glow-blue" : ""}`}
                style={{ background: isPremium ? "linear-gradient(135deg, #1a2340, #1e2a4a)" : "rgba(20,27,45,0.8)", border: isPremium ? "2px solid rgba(59,110,240,0.5)" : "1px solid rgba(59,110,240,0.15)" }}>
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)", color: "white" }}>
                    <Star size={10} fill="white" /> MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-4xl font-extrabold mb-1 gradient-text">PKR {pkg.price?.toLocaleString()}</p>
                <p className="text-slate-500 text-sm mb-6">{pkg.duration_days} days duration</p>
                <ul className="space-y-3 mb-8">
                  {features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-blue-400 flex-shrink-0" /> {f}</li>
                  ))}
                </ul>
                <Link href="/register" className={`block w-full py-3 rounded-xl text-center font-semibold transition-all ${isPremium ? "btn-primary" : "btn-outline"}`}>Get Started</Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* LEARNING WIDGET */}
      {question && (
        <section className="py-12" style={{ background: "rgba(14,19,33,0.7)", borderTop: "1px solid rgba(59,110,240,0.08)" }}>
          <div className="max-w-2xl mx-auto px-6">
            <div className="rounded-2xl p-6" style={{ background: "rgba(20,27,45,0.9)", border: "1px solid rgba(59,110,240,0.2)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={16} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Quick Knowledge</span>
                <span className="ml-auto px-2 py-0.5 rounded text-xs" style={{ background: "rgba(59,110,240,0.15)", color: "#5f8ef5" }}>{question.topic} · {question.difficulty}</span>
              </div>
              <p className="text-white font-medium mb-4 text-sm leading-relaxed">{question.question}</p>
              {showAnswer ? (
                <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <p className="text-emerald-300 text-sm leading-relaxed">{question.answer}</p>
                </div>
              ) : (
                <button onClick={() => setShowAnswer(true)} className="px-5 py-2 rounded-xl text-sm font-medium btn-outline mb-4">Show Answer</button>
              )}
              <button onClick={fetchNewQuestion} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"><RotateCcw size={12} /> Next question</button>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">How AdFlow Pro Works</h2>
          <p className="text-slate-400">Simple steps from listing to live</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", icon: <Briefcase size={24} />, title: "Create Your Ad", desc: "Fill in details, add media URLs, and select your package." },
            { step: "02", icon: <Shield size={24} />, title: "Moderation Review", desc: "Our team reviews your listing for quality and policy compliance." },
            { step: "03", icon: <CheckCircle size={24} />, title: "Payment Verified", desc: "Submit payment proof. Admin verifies and approves your listing." },
            { step: "04", icon: <Zap size={24} />, title: "Go Live!", desc: "Your ad is published and visible to thousands of buyers." },
          ].map((s, i) => (
            <div key={i} className="text-center group">
              <div className="relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ background: "rgba(59,110,240,0.12)", border: "1px solid rgba(59,110,240,0.2)" }}>
                <span className="text-blue-400">{s.icon}</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: "#2952e3" }}>{s.step.slice(1)}</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-20">
        <div className="max-w-7xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2340, #1e2a4a)", border: "1px solid rgba(59,110,240,0.3)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(59,110,240,0.15) 0%, transparent 70%)" }} />
          <h2 className="text-4xl font-extrabold text-white mb-4 relative">Ready to post your first ad?</h2>
          <p className="text-slate-400 mb-8 text-lg relative">Join thousands of sellers reaching buyers across Pakistan</p>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <Link href="/register" className="px-8 py-4 rounded-2xl font-bold text-lg btn-primary glow-blue">Post Your Ad Now <ArrowRight size={20} className="inline ml-2" /></Link>
            <Link href="/explore" className="px-8 py-4 rounded-2xl font-semibold text-lg btn-outline">Browse Listings</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}