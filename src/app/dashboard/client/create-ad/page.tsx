"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle, Image, Video, ExternalLink, ArrowRight, ArrowLeft, Loader } from "lucide-react";

const STEPS = ["Ad Details", "Media & Package", "Review & Submit"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

export default function CreateAdPage() {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "", description: "", price: "", category_id: "", city_id: "",
    mediaUrl: "", mediaType: "image" as "image" | "youtube",
    package_id: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("adflow_user");
    if (!stored) { window.location.href = "/login"; return; }
    setUser(JSON.parse(stored));
    Promise.all([
      supabase.from("categories").select("*").eq("is_active", true),
      supabase.from("cities").select("*").eq("is_active", true),
      supabase.from("packages").select("*").eq("is_active", true).order("price"),
    ]).then(([cat, city, pkg]) => {
      setCategories(cat.data || []);
      setCities(city.data || []);
      setPackages(pkg.data || []);
    });
  }, []);

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  function getYoutubeThumbnail(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
  }

  async function handleSubmit() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const pkg = packages.find(p => p.id === form.package_id);
      const now = new Date();
      const expireAt = pkg ? new Date(now.getTime() + pkg.duration_days * 86400000) : null;
      const rankScore = (pkg?.weight || 1) * 10;

      const { data: ad, error: adErr } = await supabase.from("ads").insert({
        user_id: user.id,
        package_id: form.package_id || null,
        category_id: form.category_id || null,
        city_id: form.city_id || null,
        title: form.title,
        slug: slugify(form.title),
        description: form.description,
        price: parseFloat(form.price) || null,
        status: "submitted",
        rank_score: rankScore,
        expire_at: expireAt?.toISOString(),
      }).select().single();

      if (adErr) throw adErr;

      // Add media if provided
      if (form.mediaUrl && ad) {
        const thumbnail = form.mediaType === "youtube" ? getYoutubeThumbnail(form.mediaUrl) : form.mediaUrl;
        await supabase.from("ad_media").insert({
          ad_id: ad.id,
          source_type: form.mediaType,
          original_url: form.mediaUrl,
          thumbnail_url: thumbnail,
          validation_status: "pending",
        });
      }

      // Log status history
      if (ad) {
        await supabase.from("ad_status_history").insert({
          ad_id: ad.id, previous_status: "draft",
          new_status: "submitted", changed_by: user.id, note: "Ad submitted by client",
        });

        // Create notification for user
        await supabase.from("notifications").insert({
          user_id: user.id, title: "Ad Submitted Successfully!",
          message: `Your ad "${form.title}" has been submitted for review. You'll be notified when it's approved.`,
          type: "success", link: `/dashboard/client/my-ads`,
        });
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit ad.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPkg = packages.find(p => p.id === form.package_id);

  if (success) return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role={user?.role || "client"} userName={user?.name} />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(16,185,129,0.15)" }}>
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Ad Submitted!</h2>
          <p className="text-slate-400 mb-2">Your ad is now under review by our moderators.</p>
          <p className="text-slate-500 text-sm mb-8">You&apos;ll receive a notification once it&apos;s approved.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/client/my-ads" className="px-6 py-3 rounded-xl btn-primary font-semibold">View My Ads</Link>
            <Link href="/dashboard/client/create-ad" onClick={() => { setSuccess(false); setStep(0); setForm({ title:"",description:"",price:"",category_id:"",city_id:"",mediaUrl:"",mediaType:"image",package_id:"" }); }} className="px-6 py-3 rounded-xl btn-outline font-semibold">Post Another</Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0d14" }}>
      <DashboardSidebar role={user?.role || "client"} userName={user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(59,110,240,0.1)" }}>
          <h1 className="text-2xl font-bold text-white">Post New Ad</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fill in the details to submit your listing</p>
        </div>

        <div className="max-w-2xl mx-auto p-8">
          {/* Step indicator */}
          <div className="flex items-center mb-10">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i === step ? "text-white" : i < step ? "text-white" : "text-slate-600"}`}
                    style={{ background: i === step ? "#3b6ef0" : i < step ? "#10b981" : "rgba(59,110,240,0.1)" }}>
                    {i < step ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:block ${i === step ? "text-white font-medium" : "text-slate-500"}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-px mx-4" style={{ background: i < step ? "#10b981" : "rgba(59,110,240,0.15)" }} />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-8" style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.15)" }}>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* STEP 1: Ad Details */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-white mb-6">Ad Details</h2>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Ad Title *</label>
                  <input type="text" value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. iPhone 15 Pro Max - 256GB"
                    className="w-full px-4 py-3 rounded-xl text-sm input-dark" maxLength={200} />
                  <p className="text-slate-600 text-xs mt-1">{form.title.length}/200 characters</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Description *</label>
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe your item in detail — condition, features, what's included..."
                    className="w-full px-4 py-3 rounded-xl text-sm input-dark resize-none" rows={5} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Price (PKR)</label>
                  <input type="number" value={form.price} onChange={e => update("price", e.target.value)} placeholder="e.g. 15000"
                    className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Category *</label>
                    <select value={form.category_id} onChange={e => update("category_id", e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm input-dark cursor-pointer">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">City *</label>
                    <select value={form.city_id} onChange={e => update("city_id", e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm input-dark cursor-pointer">
                      <option value="">Select city</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => { if (!form.title || !form.description || !form.category_id || !form.city_id) { setError("Please fill all required fields."); } else { setError(""); setStep(1); } }}
                  className="w-full py-3.5 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2 mt-2">
                  Next: Media & Package <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 2: Media & Package */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-6">Media & Package</h2>

                {/* Media type */}
                <div>
                  <label className="block text-sm text-slate-400 mb-3">Media Type</label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {(["image", "youtube"] as const).map(type => (
                      <button key={type} onClick={() => update("mediaType", type)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${form.mediaType === type ? "btn-primary" : "btn-outline"}`}>
                        {type === "image" ? <Image size={16} /> : <Video size={16} />}
                        {type === "image" ? "Image URL" : "YouTube Video"}
                      </button>
                    ))}
                  </div>
                  <input type="url" value={form.mediaUrl} onChange={e => update("mediaUrl", e.target.value)}
                    placeholder={form.mediaType === "youtube" ? "https://youtube.com/watch?v=..." : "https://example.com/image.jpg"}
                    className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                  {form.mediaUrl && form.mediaType === "youtube" && getYoutubeThumbnail(form.mediaUrl) && (
                    <div className="mt-2 rounded-xl overflow-hidden" style={{ maxHeight: "120px" }}>
                      <img src={getYoutubeThumbnail(form.mediaUrl)} alt="YouTube thumbnail" className="w-full object-cover" />
                    </div>
                  )}
                  {form.mediaUrl && form.mediaType === "image" && (
                    <div className="mt-2 rounded-xl overflow-hidden" style={{ maxHeight: "120px" }}>
                      <img src={form.mediaUrl} alt="Preview" className="w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </div>

                {/* Package selection */}
                <div>
                  <label className="block text-sm text-slate-400 mb-3">Select Package *</label>
                  <div className="space-y-3">
                    {packages.map(pkg => (
                      <button key={pkg.id} onClick={() => update("package_id", pkg.id)}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-left transition-all ${form.package_id === pkg.id ? "border-blue-500" : ""}`}
                        style={{
                          background: form.package_id === pkg.id ? "rgba(59,110,240,0.12)" : "rgba(20,27,45,0.6)",
                          border: `1px solid ${form.package_id === pkg.id ? "#3b6ef0" : "rgba(59,110,240,0.12)"}`,
                        }}>
                        <div>
                          <p className="text-white font-semibold">{pkg.name}</p>
                          <p className="text-slate-500 text-xs">{pkg.duration_days} days · {pkg.weight}x boost</p>
                        </div>
                        <p className="text-blue-400 font-bold">PKR {pkg.price?.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-outline font-semibold flex-shrink-0">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={() => { if (!form.package_id) { setError("Please select a package."); } else { setError(""); setStep(2); } }}
                    className="flex-1 py-3 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2">
                    Review Ad <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-white mb-6">Review & Submit</h2>
                <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(59,110,240,0.06)", border: "1px solid rgba(59,110,240,0.15)" }}>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Title</span><span className="text-white text-sm font-medium">{form.title}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Price</span><span className="text-white text-sm">PKR {parseFloat(form.price || "0").toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Package</span><span className="text-blue-400 text-sm font-medium">{selectedPkg?.name} — PKR {selectedPkg?.price?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Duration</span><span className="text-white text-sm">{selectedPkg?.duration_days} days</span></div>
                  {form.mediaUrl && <div className="flex justify-between"><span className="text-slate-400 text-sm">Media</span><span className="text-white text-sm">{form.mediaType} URL added</span></div>}
                </div>

                <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <p className="text-amber-400 text-xs leading-relaxed">
                    After submission, your ad will go through moderation review. You&apos;ll then need to submit payment proof of PKR {selectedPkg?.price?.toLocaleString()} before it goes live.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-outline font-semibold flex-shrink-0">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <Loader size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Submit Ad</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
