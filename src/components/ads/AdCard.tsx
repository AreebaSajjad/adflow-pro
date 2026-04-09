import Link from "next/link";
import { MapPin, Clock, Star, Tag, Shield, Zap } from "lucide-react";
import { Ad } from "@/lib/supabase";

interface AdCardProps {
  ad: Ad;
}

function getMediaThumb(ad: Ad): string {
  if (ad.ad_media && ad.ad_media.length > 0) {
    return ad.ad_media[0].thumbnail_url || "/placeholder.jpg";
  }
  return `https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=280&fit=crop&q=80`;
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    published: "badge-published",
    pending: "badge-pending",
    rejected: "badge-rejected",
    draft: "badge-draft",
    under_review: "badge-review",
  };
  return map[status] || "badge-draft";
}

function getPackageBadge(pkg?: { name: string }) {
  if (!pkg) return null;
  const colors: Record<string, string> = {
    Basic: "text-slate-400 border-slate-600",
    Standard: "text-blue-400 border-blue-600",
    Premium: "text-amber-400 border-amber-600",
  };
  return colors[pkg.name] || "text-slate-400 border-slate-600";
}

export default function AdCard({ ad }: AdCardProps) {
  const thumb = getMediaThumb(ad);
  const pkgColor = getPackageBadge(ad.packages);
  const isPremium = ad.packages?.name === "Premium";

  return (
    <Link href={`/ads/${ad.slug}`} className="block group">
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300 glass-card glass-card-hover"
        style={{
          border: isPremium ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(59,110,240,0.12)",
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: "190px" }}>
          <img
            src={thumb}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=280&fit=crop"; }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,13,20,0.8) 0%, transparent 60%)" }} />

          {/* Package badge */}
          {ad.packages && (
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${pkgColor}`} style={{ background: "rgba(10,13,20,0.7)" }}>
              {isPremium && <Zap size={10} className="inline mr-1" />}
              {ad.packages.name}
            </div>
          )}

          {/* Featured star */}
          {ad.packages?.is_featured && (
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.9)" }}>
              <Star size={12} fill="white" className="text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
            {ad.title}
          </h3>

          {/* Price */}
          {ad.price && (
            <p className="text-lg font-bold mb-3" style={{ color: "#5f8ef5" }}>
              PKR {ad.price.toLocaleString()}
            </p>
          )}

          {/* Meta */}
          <div className="space-y-1.5">
            {ad.categories && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Tag size={11} />
                <span>{ad.categories.name}</span>
              </div>
            )}
            {ad.cities && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={11} />
                <span>{ad.cities.name}</span>
              </div>
            )}
            {ad.expire_at && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Clock size={11} />
                <span>Expires {new Date(ad.expire_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader
export function AdCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden glass-card">
      <div className="shimmer" style={{ height: "190px" }} />
      <div className="p-4 space-y-3">
        <div className="shimmer h-4 rounded-lg w-3/4" />
        <div className="shimmer h-6 rounded-lg w-1/2" />
        <div className="shimmer h-3 rounded-lg w-full" />
        <div className="shimmer h-3 rounded-lg w-2/3" />
      </div>
    </div>
  );
}
