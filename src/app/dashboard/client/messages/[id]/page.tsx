"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Send, ArrowLeft, CreditCard, X } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const convId = params?.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [conv, setConv] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payment, setPayment] = useState({ amount: "", method: "jazzcash", account: "", note: "" });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setCurrentUser(d.user);
      loadData();
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadData() {
    const [c1, c2] = await Promise.all([
      fetch("/api/conversations").then(r => r.json()),
      fetch(`/api/conversations/${convId}/messages`).then(r => r.json()),
    ]);
    const found = (c1.conversations || []).find((c: any) => c.id === convId);
    if (found) setConv(found);
    setMessages(c2.messages || []);
  }

  async function sendMessage() {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${convId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, message_type: "text" }),
    });
    const data = await res.json();
    if (data.message) { setMessages(p => [...p, data.message]); setText(""); }
    setSending(false);
  }

  async function sendPayment() {
    if (!payment.amount || !payment.account || sending) return;
    setSending(true);
    const content = `Payment of PKR ${payment.amount} via ${payment.method.toUpperCase()} — Account/TXN: ${payment.account}. Note: ${payment.note || "N/A"}`;
    const res = await fetch(`/api/conversations/${convId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, message_type: "payment_proof", payment_amount: parseFloat(payment.amount), payment_method: payment.method, payment_account: payment.account }),
    });
    const data = await res.json();
    if (data.message) {
      setMessages(p => [...p, data.message]);
      setShowPayment(false);
      setPayment({ amount: "", method: "jazzcash", account: "", note: "" });
    }
    setSending(false);
  }

  const isBuyer = currentUser?.id === conv?.buyer_id;
  const other = conv ? (isBuyer ? conv.seller : conv.buyer) : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0d14" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-4 pt-24 pb-6 flex flex-col" style={{ minHeight: "100vh" }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl" style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(59,110,240,0.15)" }}>
          <Link href="/dashboard/client/messages" className="text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
            style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)" }}>
            {(other?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{other?.name || "User"}</p>
            {conv?.ads && (
              <Link href={`/ads/${conv.ads.slug}`} className="text-blue-400 text-xs hover:underline">
                {conv.ads.title} — PKR {conv.ads.price?.toLocaleString()}
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 mb-4 overflow-y-auto px-1" style={{ minHeight: "400px", maxHeight: "500px" }}>
          {messages.length === 0 && (
            <div className="text-center py-16 text-slate-600 text-sm">No messages yet. Say hello! 👋</div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === currentUser?.id;
            const isPayment = msg.message_type === "payment_proof";
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="max-w-sm">
                  {isPayment ? (
                    <div className="rounded-2xl p-4" style={{ background: isMe ? "rgba(59,110,240,0.2)" : "rgba(16,185,129,0.1)", border: `1px solid ${isMe ? "rgba(59,110,240,0.4)" : "rgba(16,185,129,0.3)"}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={14} style={{ color: isMe ? "#5f8ef5" : "#10b981" }} />
                        <span className="text-xs font-semibold" style={{ color: isMe ? "#5f8ef5" : "#10b981" }}>Payment Proof</span>
                      </div>
                      <p className="text-white text-sm">{msg.content}</p>
                      <p className="text-slate-500 text-xs mt-2">{new Date(msg.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl px-4 py-3" style={{ background: isMe ? "rgba(59,110,240,0.25)" : "rgba(20,27,45,0.9)", border: `1px solid ${isMe ? "rgba(59,110,240,0.4)" : "rgba(59,110,240,0.1)"}` }}>
                      <p className="text-white text-sm">{msg.content}</p>
                      <p className="text-slate-500 text-xs mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Payment form */}
        {showPayment && (
          <div className="mb-4 rounded-2xl p-5" style={{ background: "rgba(13,18,32,0.95)", border: "1px solid rgba(59,110,240,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <CreditCard size={16} className="text-blue-400" /> Send Payment Proof
              </h3>
              <button onClick={() => setShowPayment(false)}><X size={16} className="text-slate-500 hover:text-white" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Amount (PKR)</label>
                <input type="number" value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. 5000" className="w-full px-3 py-2 rounded-xl text-sm text-white"
                  style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.2)" }} />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Payment Method</label>
                <select value={payment.method} onChange={e => setPayment(p => ({ ...p, method: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white"
                  style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.2)" }}>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Account / Transaction ID</label>
                <input type="text" value={payment.account} onChange={e => setPayment(p => ({ ...p, account: e.target.value }))}
                  placeholder="03XX-XXXXXXX or TXN ID" className="w-full px-3 py-2 rounded-xl text-sm text-white"
                  style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.2)" }} />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Note (optional)</label>
                <input type="text" value={payment.note} onChange={e => setPayment(p => ({ ...p, note: e.target.value }))}
                  placeholder="Any info for seller" className="w-full px-3 py-2 rounded-xl text-sm text-white"
                  style={{ background: "rgba(59,110,240,0.08)", border: "1px solid rgba(59,110,240,0.2)" }} />
              </div>
              <button onClick={sendPayment} disabled={sending || !payment.amount || !payment.account}
                className="w-full py-2.5 rounded-xl font-semibold text-sm btn-primary disabled:opacity-50">
                {sending ? "Sending..." : "Send Payment Proof"}
              </button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="flex gap-2 items-end">
          <button onClick={() => setShowPayment(!showPayment)} title="Send Payment Proof"
            className="p-3 rounded-xl flex-shrink-0"
            style={{ background: showPayment ? "rgba(59,110,240,0.3)" : "rgba(59,110,240,0.1)", border: "1px solid rgba(59,110,240,0.25)", color: "#5f8ef5" }}>
            <CreditCard size={18} />
          </button>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); }}}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl text-sm text-white"
            style={{ background: "rgba(13,18,32,0.9)", border: "1px solid rgba(59,110,240,0.2)" }} />
          <button onClick={sendMessage} disabled={sending || !text.trim()}
            className="p-3 rounded-xl btn-primary disabled:opacity-50 flex-shrink-0">
            <Send size={18} />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}