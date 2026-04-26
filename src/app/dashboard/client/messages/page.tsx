"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MessageCircle, ChevronRight } from "lucide-react";

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setCurrentUser(d.user);
      fetch("/api/conversations").then(r => r.json()).then(d => {
        setConversations(d.conversations || []);
        setLoading(false);
      });
    });
  }, []);

  function getLastMessage(conv: any) {
    const msgs = conv.messages || [];
    if (!msgs.length) return "No messages yet";
    const last = msgs[msgs.length - 1];
    return last.message_type === "payment_proof" ? "💳 Payment proof sent" : last.content;
  }

  function getUnread(conv: any) {
    if (!currentUser) return 0;
    return (conv.messages || []).filter((m: any) => !m.is_read && m.sender_id !== currentUser.id).length;
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,110,240,0.15)" }}>
            <MessageCircle size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-slate-500 text-sm">Your conversations with buyers & sellers</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="shimmer h-20 rounded-2xl" />)}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No conversations yet</p>
            <Link href="/explore" className="mt-4 inline-block px-6 py-2.5 rounded-xl btn-primary text-sm font-medium">Browse Ads</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(conv => {
              const isBuyer = currentUser?.id === conv.buyer_id;
              const other = isBuyer ? conv.seller : conv.buyer;
              const unread = getUnread(conv);
              return (
                <Link key={conv.id} href={`/dashboard/client/messages/${conv.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:border-blue-500/30"
                  style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.12)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)" }}>
                    {(other?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium text-sm">{other?.name || "User"}</p>
                      <p className="text-slate-600 text-xs">{new Date(conv.last_message_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</p>
                    </div>
                    <p className="text-slate-500 text-xs truncate mb-1">{conv.ads?.title}</p>
                    <p className="text-slate-400 text-xs truncate">{getLastMessage(conv)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#3b6ef0" }}>{unread}</span>
                    )}
                    <ChevronRight size={16} className="text-slate-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}