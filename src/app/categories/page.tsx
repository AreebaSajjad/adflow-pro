"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase, Category } from "@/lib/supabase";
import { Smartphone, Car, Home, Briefcase, Wrench, ShoppingBag, Dumbbell, Leaf, Grid, ChevronRight } from "lucide-react";

const ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  electronics: { icon: <Smartphone size={28} />, color: "#3b6ef0", bg: "rgba(59,110,240,0.12)" },
  vehicles:    { icon: <Car size={28} />,        color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  property:    { icon: <Home size={28} />,        color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  jobs:        { icon: <Briefcase size={28} />,   color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  services:    { icon: <Wrench size={28} />,      color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  fashion:     { icon: <ShoppingBag size={28} />, color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  sports:      { icon: <Dumbbell size={28} />,    color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  "home-garden":{ icon: <Leaf size={28} />,       color: "#84cc16", bg: "rgba(132,204,22,0.12)" },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [adCounts, setAdCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from("categories").select("*").eq("is_active", true);
      if (cats) {
        setCategories(cats as Category[]);
        // Fetch ad counts per category
        const counts: Record<string, number> = {};
        await Promise.all(cats.map(async (cat) => {
          const { count } = await supabase.from("ads").select("*", { count: "exact", head: true }).eq("category_id", cat.id).eq("status", "published");
          counts[cat.id] = count || 0;
        }));
        setAdCounts(counts);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(59,110,240,0.12)", border: "1px solid rgba(59,110,240,0.3)", color: "#5f8ef5" }}>
              <Grid size={12} /> Browse by Category
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-3">All Categories</h1>
            <p className="text-slate-400">Find exactly what you&apos;re looking for</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {Array(8).fill(0).map((_, i) => <div key={i} className="shimmer h-44 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map(cat => {
                const meta = ICONS[cat.slug] || { icon: <Grid size={28} />, color: "#3b6ef0", bg: "rgba(59,110,240,0.12)" };
                return (
                  <Link key={cat.id} href={`/explore?category=${cat.slug}`}
                    className="group flex flex-col items-center p-8 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2"
                    style={{ background: "rgba(20,27,45,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = meta.color + "50"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,110,240,0.12)"; }}
                  >
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: meta.bg, color: meta.color }}>
                      {meta.icon}
                    </div>
                    <h3 className="text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors">{cat.name}</h3>
                    <p className="text-slate-500 text-xs mb-3">{adCounts[cat.id] || 0} active listings</p>
                    <div className="flex items-center gap-1 text-xs" style={{ color: meta.color }}>
                      Browse <ChevronRight size={12} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
