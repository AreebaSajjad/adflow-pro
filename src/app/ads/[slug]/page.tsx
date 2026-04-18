"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import {
  MapPin, Tag, Clock, Star, Zap, Shield, ChevronRight,
  Phone, Mail, ArrowLeft, Share2, Flag, CheckCircle,
  Calendar, Package, Eye, ExternalLink, Play
} from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Active Listing", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  expired:   { label: "Expired",        color: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

function getYoutubeThumbnail(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

function MediaPreview({ media }: { media: any[] }) {
  const [active, setActive] = useState(0);
  if (!media || media.length === 0) {
    return (
      <div className="w-full rounded-2xl flex items-center justify-center" style={{ height: "320px", background: "rgba(20,27,45,0.8)", border: "1px solid rgba(59,110,240,0.15)" }}>
        <div className="text-center">
          <Eye size={40} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-600 text-sm">No media available</p>
        </div>
      </div>
    );
  }

  const current = media[active];
  const isYoutube = current.source_type === "youtube";
  const ytThumb = isYoutube ? getYoutubeThumbnail(current.original_url) : null;
  const displaySrc = current.thumbnail_url || ytThumb || current.original_url;

  return (
    <div className="space-y-3">
      {/* Main media */}
      <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "340px", background: "rgba(10,13,20,0.9)" }}>
        <img
          src={displaySrc}
          alt="Ad media"
          className="w-full h-full object-contain"
          onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=340&fit=crop"; }}
        />
        {isYoutube && (
          <a href={current.original_url} target="_blank" rel="noreferrer"
            className="absolute inset-0 flex items-center justify-center group">
            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: "rgba(239,68,68,0.9)" }}>
              <Play size={24} fill="white" className="text-white ml-1" />
            </div>
          </a>
        )}
        {/* Source badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium capitalize" style={{ background: "rgba(10,13,20,0.8)", color: "#5f8ef5", border: "1px solid rgba(59,110,240,0.3)" }}>
          {current.source_type}
        </div>
      </div>

      {/* Thumbnails row if multiple */}
      {media.length > 1 && (
        <div className="flex gap-2">
          {media.map((m, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all"
              style={{ border: i === active ? "2px solid #3b6ef0" : "1px solid rgba(59,110,240,0.15)", opacity: i === active ? 1 : 0.6 }}>
              <img src={m.thumbnail_url || m.original_url} alt="" className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [ad, setAd] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) fetchAd();
  }, [slug]);

  async function fetchAd() {
    setLoading(true);
    const { data, error } = await supabase
      .from("ads")
      .select("*, packages(*), categories(*), cities(*), ad_media(*)")
      .eq("slug", slug)
      .single();

    if (error || !data) { setNotFound(true); setLoading(false); return; }
    setAd(data);

    // Fetch seller profile
    const { data: profile } = await supabase
      .from("seller_profiles")
      .select("*, users(name, email, created_at)")
      .eq("user_id", data.user_id)
      .single();
    if (profile) setSeller(profile);
    setLoading(false);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function daysLeft() {
    if (!ad?.expire_at) return null;
    return Math.max(0, Math.ceil((new Date(ad.expire_at).getTime() - Date.now()) / 86400000));
  }

  // Loading skeleton
  if (loading) return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="shimmer h-80 rounded-2xl" />
            <div className="shimmer h-8 rounded-xl w-3/4" />
            <div className="shimmer h-6 rounded-xl w-1/4" />
            <div className="shimmer h-32 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="shimmer h-48 rounded-2xl" />
            <div className="shimmer h-32 rounded-2xl" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  // Not found
  if (notFound) return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-40 pb-20 text-center px-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Flag size={36} className="text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Ad Not Found</h1>
        <p className="text-slate-400 mb-8">This listing may have expired or been removed.</p>
        <Link href="/explore" className="px-6 py-3 rounded-xl btn-primary font-semibold">Browse All Ads</Link>
      </div>
      <Footer />
    </div>
  );

  const days = daysLeft();
  const isPremium = ad.packages?.name === "Premium";
  const isStandard = ad.packages?.name === "Standard";

  return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/explore" className="hover:text-blue-400 transition-colors">Explore</Link>
            {ad.categories && <>
              <ChevronRight size={14} />
              <Link href={`/explore?category=${ad.categories.slug}`} className="hover:text-blue-400 transition-colors">{ad.categories.name}</Link>
            </>}
            <ChevronRight size={14} />
            <span className="text-slate-600 truncate max-w-xs">{ad.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT — Media + Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Media */}
              <MediaPreview media={ad.ad_media || []} />

              {/* Title + price */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}>
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {ad.packages && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                      style={{
                        background: isPremium ? "rgba(245,158,11,0.12)" : isStandard ? "rgba(59,110,240,0.12)" : "rgba(100,116,139,0.12)",
                        color: isPremium ? "#f59e0b" : isStandard ? "#5f8ef5" : "#94a3b8",
                        border: `1px solid ${isPremium ? "rgba(245,158,11,0.3)" : isStandard ? "rgba(59,110,240,0.3)" : "rgba(100,116,139,0.2)"}`,
                      }}>
                      {isPremium && <Star size={10} fill="currentColor" />}
                      {ad.packages.name}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                    <CheckCircle size={10} className="inline mr-1" /> Moderated
                  </span>
                  {days !== null && days <= 3 && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
                      Expires in {days} day{days !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-3 leading-snug">{ad.title}</h1>

                {ad.price && (
                  <p className="text-3xl font-extrabold mb-4 gradient-text">
                    PKR {ad.price.toLocaleString()}
                  </p>
                )}

                {/* Meta pills */}
                <div className="flex flex-wrap gap-3">
                  {ad.categories && (
                    <Link href={`/explore?category=${ad.categories.slug}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.12)" }}>
                      <Tag size={12} /> {ad.categories.name}
                    </Link>
                  )}
                  {ad.cities && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400"
                      style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.12)" }}>
                      <MapPin size={12} /> {ad.cities.name}
                    </span>
                  )}
                  {ad.expire_at && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400"
                      style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.12)" }}>
                      <Calendar size={12} /> Listed {new Date(ad.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}>
                <h2 className="font-semibold text-white mb-4">Description</h2>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{ad.description}</p>
              </div>

              {/* Ad details table */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}>
                <h2 className="font-semibold text-white mb-4">Listing Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Category", ad.categories?.name],
                    ["Location", ad.cities?.name],
                    ["Package", ad.packages?.name],
                    ["Listed On", new Date(ad.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })],
                    ad.expire_at ? ["Expires On", new Date(ad.expire_at).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })] : null,
                    ["Ad ID", ad.id.slice(0, 8).toUpperCase()],
                  ].filter(Boolean).map(([k, v], i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "rgba(59,110,240,0.05)", border: "1px solid rgba(59,110,240,0.08)" }}>
                      <p className="text-slate-500 text-xs mb-0.5">{k}</p>
                      <p className="text-white text-sm font-medium">{v || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="flex gap-3">
                <button onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm btn-outline font-medium">
                  <Share2 size={15} />
                  {copied ? "Copied!" : "Share"}
                </button>
                <Link href="/explore" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm btn-outline font-medium">
                  <ArrowLeft size={15} /> Back to Listings
                </Link>
              </div>
            </div>

            {/* RIGHT — Seller card + safety */}
            <div className="space-y-5">

              {/* Contact / Seller card */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.2)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)" }}>
                    {(seller?.display_name || seller?.users?.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{seller?.display_name || seller?.users?.name || "Seller"}</p>
                    {seller?.business_name && <p className="text-slate-500 text-xs">{seller.business_name}</p>}
                    {seller?.is_verified && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 mt-0.5">
                        <CheckCircle size={10} /> Verified Seller
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-3 mb-5">
                  {seller?.phone && (
                    <a href={`tel:${seller.phone}`}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all btn-primary font-medium text-sm">
                      <Phone size={16} /> {seller.phone}
                    </a>
                  )}
                  {seller?.users?.email && (
                    <a href={`mailto:${seller.users.email}`}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all btn-outline text-sm font-medium">
                      <Mail size={16} /> Send Email
                    </a>
                  )}
                  {!seller?.phone && !seller?.users?.email && (
                    <div className="px-4 py-3 rounded-xl text-sm text-center text-slate-500" style={{ background: "rgba(59,110,240,0.06)" }}>
                      Contact info not available
                    </div>
                  )}
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid rgba(59,110,240,0.1)" }}>
                  {seller?.city && (
                    <p className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <MapPin size={12} className="text-blue-500" /> {seller.city}
                    </p>
                  )}
                  {seller?.users?.created_at && (
                    <p className="text-xs text-slate-600">
                      Member since {new Date(seller.users.created_at).toLocaleDateString("en-PK", { month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>

              {/* Safety tips */}
              <div className="rounded-2xl p-5" style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-blue-400" />
                  <h3 className="font-semibold text-white text-sm">Safety Tips</h3>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Meet in a public place for transactions",
                    "Never pay in advance without seeing the item",
                    "Verify item condition before payment",
                    "Report suspicious listings immediately",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Package info */}
              {ad.packages && (
                <div className="rounded-2xl p-5" style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={15} className="text-blue-400" />
                    <h3 className="font-semibold text-white text-sm">Listing Package</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Plan</span>
                      <span className="text-white font-medium">{ad.packages.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Duration</span>
                      <span className="text-white">{ad.packages.duration_days} days</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Visibility</span>
                      <span className="text-white">{ad.packages.weight}x boost</span>
                    </div>
                    {days !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Remaining</span>
                        <span style={{ color: days <= 3 ? "#f59e0b" : "#10b981" }}>{days} days left</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Report button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs text-slate-600 hover:text-red-400 transition-colors"
                style={{ border: "1px solid rgba(59,110,240,0.08)" }}>
                <Flag size={12} /> Report this listing
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
