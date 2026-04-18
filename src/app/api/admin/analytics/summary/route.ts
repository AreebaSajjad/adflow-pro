import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("adflow_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || !["admin", "super_admin"].includes(payload.role as string))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [adsRes, usersRes, paymentsRes, categoriesRes, citiesRes] = await Promise.all([
    supabaseAdmin.from("ads").select("id, status, created_at, rank_score, package_id, category_id, city_id, packages(name, price), categories(name), cities(name)"),
    supabaseAdmin.from("users").select("id, role, status, created_at"),
    supabaseAdmin.from("payments").select("id, amount, status, created_at, method"),
    supabaseAdmin.from("categories").select("id, name"),
    supabaseAdmin.from("cities").select("id, name"),
  ]);

  const ads = adsRes.data || [];
  const users = usersRes.data || [];
  const payments = paymentsRes.data || [];

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Listings metrics
  const totalAds = ads.length;
  const activeAds = ads.filter(a => a.status === "published").length;
  const pendingReview = ads.filter(a => ["submitted", "under_review"].includes(a.status)).length;
  const expiredAds = ads.filter(a => a.status === "expired").length;
  const rejectedAds = ads.filter(a => a.status === "rejected").length;
  const thisMonthAds = ads.filter(a => new Date(a.created_at) >= thisMonth).length;
  const lastMonthAds = ads.filter(a => new Date(a.created_at) >= lastMonth && new Date(a.created_at) < thisMonth).length;

  // Revenue metrics
  const verifiedPayments = payments.filter(p => p.status === "verified");
  const totalRevenue = verifiedPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const thisMonthRevenue = verifiedPayments.filter(p => new Date(p.created_at) >= thisMonth).reduce((s, p) => s + (p.amount || 0), 0);
  const lastMonthRevenue = verifiedPayments.filter(p => new Date(p.created_at) >= lastMonth && new Date(p.created_at) < thisMonth).reduce((s, p) => s + (p.amount || 0), 0);

  // Revenue by package
  const revenueByPackage = ads
    .filter(a => a.status === "published" && a.packages)
    .reduce((acc: Record<string, number>, a: any) => {
      const name = a.packages?.name || "Unknown";
      acc[name] = (acc[name] || 0) + (a.packages?.price || 0);
      return acc;
    }, {});

  // Moderation metrics
  const reviewed = ads.filter(a => a.status !== "draft").length;
  const approved = ads.filter(a => !["rejected", "draft", "submitted"].includes(a.status)).length;
  const approvalRate = reviewed > 0 ? Math.round((approved / reviewed) * 100) : 0;

  // Ads by category
  const adsByCategory = ads.reduce((acc: Record<string, number>, a: any) => {
    const name = a.categories?.name || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  // Ads by city
  const adsByCity = ads.reduce((acc: Record<string, number>, a: any) => {
    const name = a.cities?.name || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  // Monthly ads trend (last 6 months)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    return {
      month: d.toLocaleString("en", { month: "short" }),
      ads: ads.filter(a => new Date(a.created_at) >= d && new Date(a.created_at) < end).length,
      revenue: verifiedPayments.filter(p => new Date(p.created_at) >= d && new Date(p.created_at) < end).reduce((s, p) => s + (p.amount || 0), 0),
    };
  });

  // Users
  const totalUsers = users.filter(u => u.role === "client").length;
  const newUsersThisMonth = users.filter(u => u.role === "client" && new Date(u.created_at) >= thisMonth).length;

  // Payment methods breakdown
  const paymentMethods = payments.reduce((acc: Record<string, number>, p) => {
    acc[p.method] = (acc[p.method] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    listings: { totalAds, activeAds, pendingReview, expiredAds, rejectedAds, thisMonthAds, lastMonthAds },
    revenue: { totalRevenue, thisMonthRevenue, lastMonthRevenue, revenueByPackage },
    moderation: { approvalRate, approved, rejected: rejectedAds, reviewed },
    taxonomy: { adsByCategory, adsByCity },
    users: { totalUsers, newUsersThisMonth },
    trends: { monthly: monthlyTrend },
    payments: { total: payments.length, verified: verifiedPayments.length, pending: payments.filter(p => p.status === "pending").length, methods: paymentMethods },
  });
}
