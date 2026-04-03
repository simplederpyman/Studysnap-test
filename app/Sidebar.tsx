"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/chat", icon: "💬", label: "AI Chat" },
  { href: "/create", icon: "✨", label: "Create" },
  { href: "/library", icon: "📚", label: "Library" },
  { href: "/study/flashcards", icon: "🃏", label: "Flashcards" },
  { href: "/study/quiz", icon: "🧠", label: "Quiz" },
] as const;

const bottom: { href: string; icon: string; label: string }[] = [];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Menu openen">☰</button>
        <Link href="/" className="sidebar-brand" style={{ margin: 0 }}>
          <span className="sidebar-brand-icon">📸</span>
          <span className="sidebar-brand-text">StudySnap AI</span>
        </Link>
        <Link href="/chat" className="btn-icon" aria-label="Chat">💬</Link>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${open ? " open" : ""}`}>
        <Link href="/" className="sidebar-brand" onClick={() => setOpen(false)}>
          <span className="sidebar-brand-icon">📸</span>
          <span className="sidebar-brand-text">StudySnap AI</span>
        </Link>

        <nav className="sidebar-nav">
          {nav.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${isActive(href) ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {bottom.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${isActive(href) ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
