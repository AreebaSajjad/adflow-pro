import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "AdFlow Pro — Sponsored Listing Marketplace",
  description: "Pakistan's premier moderated ads marketplace with verified sellers and smart packages.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
