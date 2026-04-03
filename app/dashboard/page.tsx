"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { readSets } from "@/lib/storage";

export default function DashboardPage() {
  const [sets] = useState(readSets());

  const stats = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const setsThisWeek = sets.filter((s) => new Date(s.createdAt) >= weekAgo).length;
    const practiceMinutes = sets.reduce((a, b) => a + b.stats.practiceMinutes, 0);
    const retention = sets.length
      ? Math.round(sets.reduce((a, b) => a + b.stats.retentionPercentage, 0) / sets.length)
      : 0;
    return { setsThisWeek, practiceMinutes, retention };
  }, [sets]);

  const suggestions = [...sets]
    .sort((a, b) => a.stats.retentionPercentage - b.stats.retentionPercentage)
    .slice(0, 3);

  return (
    <div className="stack">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Dashboard</h1>
          <p className="muted small">Recente projecten, snelle acties en voortgangsstatistieken.</p>
        </div>
        <div className="flex gap-2 wrap">
          <Link href="/create" className="btn btn-primary">✨ Nieuwe set</Link>
          <Link href="/create?tab=photo" className="btn">📸 Foto</Link>
          <Link href="/create?tab=text" className="btn">📝 Tekst</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-number">{stats.setsThisWeek}</div>
          <div className="small muted" style={{ marginTop: ".35rem" }}>Sets deze week</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.practiceMinutes}</div>
          <div className="small muted" style={{ marginTop: ".35rem" }}>Oefenminuten</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.retention}%</div>
          <div className="small muted" style={{ marginTop: ".35rem" }}>Retentie</div>
        </div>
      </div>

      {/* Recent sets */}
      <section className="card">
        <h2 style={{ marginBottom: "1rem", fontWeight: 700 }}>📂 Recente projecten</h2>
        {sets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>📭</div>
            <p className="muted small">Nog geen sets. Start via Create.</p>
            <Link href="/create" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>
              ✨ Eerste set maken
            </Link>
          </div>
        ) : (
          <div className="grid-3">
            {sets.slice(0, 9).map((set) => (
              <article key={set.id} className="card card-sm" style={{ cursor: "pointer" }}>
                <h3 className="truncate" style={{ marginBottom: ".35rem" }}>{set.title}</h3>
                <div className="flex gap-2" style={{ marginBottom: ".5rem" }}>
                  <span className="badge">{set.category}</span>
                  <span className="small muted">{set.language}</span>
                </div>
                <p className="small muted">{set.sourceSummary.slice(0, 100)}…</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Suggestions */}
      <section className="card">
        <h2 style={{ marginBottom: "1rem", fontWeight: 700 }}>🎯 Aanbevolen voor jou</h2>
        {suggestions.length === 0 ? (
          <p className="small muted">Nog geen aanbevelingen.</p>
        ) : (
          <div className="stack" style={{ gap: ".5rem" }}>
            {suggestions.map((s) => (
              <div key={s.id} className="flex items-center justify-between" style={{ padding: ".75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: ".75rem", border: "1px solid var(--glass-border)" }}>
                <div>
                  <span className="font-semibold">{s.title}</span>
                  <span className="small muted" style={{ marginLeft: ".5rem" }}>retentie {s.stats.retentionPercentage}%</span>
                </div>
                <Link href="/study/flashcards" className="btn" style={{ fontSize: ".8rem", padding: ".35rem .75rem" }}>Herhalen →</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
