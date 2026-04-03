import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudySnap AI",
  description: "Intelligent leerplatform voor quizzen, flashcards en uitleg.",
};

const nav = [
  ["/", "Home"],
  ["/dashboard", "Dashboard"],
  ["/create", "Create"],
  ["/library", "Library"],
  ["/study/flashcards", "Study"],
  ["/settings", "Settings"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <header className="topbar">
          <div className="wrap row between center">
            <Link href="/" className="brand">StudySnap AI</Link>
            <nav className="row gap-sm wrap-nav">
              {nav.map(([href, label]) => (
                <Link key={href} href={href} className="pill">{label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="wrap main">{children}</main>
      </body>
    </html>
  );
}
