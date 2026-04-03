import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./Sidebar";

export const metadata: Metadata = {
  title: "StudySnap AI",
  description: "Intelligent leerplatform voor quizzen, flashcards en uitleg.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="page-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
