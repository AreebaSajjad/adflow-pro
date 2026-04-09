import Link from "next/link";
import { Zap, Mail, Phone, MapPin, X } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#080b12", borderTop: "1px solid rgba(59,110,240,0.12)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #3b6ef0, #2952e3)" }}>A</div>
              <span className="font-bold text-lg text-white">AdFlow <span className="gradient-text">Pro</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">Pakistan's premier moderated ads marketplace. Post, verify, publish — with confidence.</p>
            <div className="flex gap-3">
              {/* X (Twitter) */}
              <a href="https://x.com/adflowpro" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-blue-500/20 transition-all duration-200 hover:scale-110" 
                 style={{ border: "1px solid rgba(59,130,246,0.3)" }}>
                <X size={16} />
              </a>
              
              {/* Facebook - SVG fallback */}
              <a href="https://facebook.com/adflowpro" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-blue-600/20 transition-all duration-200 hover:scale-110" 
                 style={{ border: "1px solid rgba(24,119,242,0.3)" }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram - SVG fallback */}
              <a href="https://instagram.com/adflowpro" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-pink-500/20 transition-all duration-200 hover:scale-110" 
                 style={{ border: "1px solid rgba(244,62,94,0.3)" }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="18" cy="6" r="1"/>
                </svg>
              </a>

              {/* LinkedIn - SVG fallback */}
              <a href="https://linkedin.com/company/adflowpro" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-blue-700/20 transition-all duration-200 hover:scale-110" 
                 style={{ border: "1px solid rgba(0,119,181,0.3)" }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-3">
              {["Explore Ads", "Packages", "Categories", "Cities", "Post Ad"].map(link => (
                <li key={link}>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors hover:underline underline-offset-2">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-3">
              {["FAQ", "Contact Us", "Terms of Service", "Privacy Policy", "Report an Ad"].map(link => (
                <li key={link}>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors hover:underline underline-offset-2">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-400 text-sm hover:text-blue-400 transition-colors cursor-pointer">
                <Mail size={14} className="text-blue-500 flex-shrink-0" /> support@adflowpro.pk
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm hover:text-blue-400 transition-colors cursor-pointer">
                <Phone size={14} className="text-blue-500 flex-shrink-0" /> +92 300 1234567
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm hover:text-blue-400 transition-colors cursor-pointer">
                <MapPin size={14} className="text-blue-500 flex-shrink-0" /> Islamabad, Pakistan
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: "1px solid rgba(59,110,240,0.1)" }}>
          <p className="text-slate-500 text-sm">© 2025 AdFlow Pro. All rights reserved.</p>
          <p className="text-slate-600 text-xs">Built with Next.js + Supabase</p>
        </div>
      </div>
    </footer>
  );
}