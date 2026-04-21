"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/moderator");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0d14" }}>
      <p className="text-slate-400">Loading review queue...</p>
    </div>
  );
}
