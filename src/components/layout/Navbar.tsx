"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Zap, Bell, User, ChevronDown, Search } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50" style={{ background: "rgba(10,13,20,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(59,110,240,0.15)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)" }}>
              A
            </div>
            <span className="font-bold text-lg text-white">AdFlow <span className="gradient-text">Pro</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/explore" className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">Explore</Link>
            <Link href="/packages" className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">Packages</Link>
            <Link href="/categories" className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">Categories</Link>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Search size={18} />
            </button>
            <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-all btn-outline rounded-lg">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium rounded-lg btn-primary">
              Post Ad
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden" style={{ background: "#0f1421", borderTop: "1px solid rgba(59,110,240,0.15)" }}>
          <div className="px-4 py-4 space-y-2">
            <Link href="/explore" onClick={() => setOpen(false)} className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">Explore</Link>
            <Link href="/packages" onClick={() => setOpen(false)} className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">Packages</Link>
            <Link href="/categories" onClick={() => setOpen(false)} className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">Categories</Link>
            <div className="pt-2 border-t border-white/10 space-y-2">
              <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-3 text-slate-300 hover:text-white rounded-lg text-center btn-outline">Login</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block px-4 py-3 text-white rounded-lg text-center btn-primary">Post Ad</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
