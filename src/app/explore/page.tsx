"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdCard, { AdCardSkeleton } from "@/components/ads/AdCard";
import { supabase, Ad, Category, City } from "@/lib/supabase";
import { Search, Filter, SlidersHorizontal, X, ChevronDown, MapPin, Tag } from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedCity, setSelectedCity] = useState("");
  const [sortBy, setSortBy] = useState("rank_score");
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { fetchFilters(); }, []);
  useEffect(() => { fetchAds(); }, [search, selectedCategory, selectedCity, sortBy]);

  async function fetchFilters() {
    const [catRes, cityRes] = await Promise.all([
      supabase.from("categories").select("*").eq("is_active", true),
      supabase.from("cities").select("*").eq("is_active", true),
    ]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    if (cityRes.data) setCities(cityRes.data as City[]);
  }

  async function fetchAds() {
    setLoading(true);
    try {
      let query = supabase.from("ads").select("*, packages(*), categories(*), cities(*), ad_media(*)", { count: "exact" }).eq("status", "published");
      if (search) query = query.ilike("title", `%${search}%`);
      if (selectedCategory) {
        const cat = categories.find(c => c.slug === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase());
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (selectedCity) {
        const city = cities.find(c => c.slug === selectedCity);
        if (city) query = query.eq("city_id", city.id);
      }
      query = query.order(sortBy as any, { ascending: false }).limit(24);
      const { data, count } = await query;
      if (data) setAds(data as Ad[]);
      if (count !== null) setTotalCount(count);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch(""); setSelectedCategory(""); setSelectedCity(""); setSortBy("rank_score");
  }

  const hasFilters = search || selectedCategory || selectedCity;

  return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="py-10" style={{ background: "rgba(14,19,33,0.9)", borderBottom: "1px solid rgba(59,110,240,0.12)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-white mb-6">Explore Listings</h1>
            {/* Search + filter row */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm input-dark" />
              </div>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl text-sm input-dark cursor-pointer">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                className="px-4 py-3 rounded-xl text-sm input-dark cursor-pointer">
                <option value="">All Cities</option>
                {cities.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl text-sm input-dark cursor-pointer">
                <option value="rank_score">Best Match</option>
                <option value="created_at">Newest First</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              {loading ? "Searching..." : `${totalCount} listing${totalCount !== 1 ? "s" : ""} found`}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(12).fill(0).map((_, i) => <AdCardSkeleton key={i} />)}
            </div>
          ) : ads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(59,110,240,0.1)" }}>
                <Search size={36} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="px-6 py-3 rounded-xl btn-primary font-semibold">Clear Filters</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{background:"#0a0d14"}}><Navbar /><div className="pt-32 text-center text-slate-400">Loading...</div></div>}>
      <ExploreContent />
    </Suspense>
  );
}
