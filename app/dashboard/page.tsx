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
      <section className="card">
        <h1>Dashboard</h1>
        <p className="muted small">Recente projecten, snelle acties en voortgangsstatistieken.</p>
        <div className="row gap-sm" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <Link href="/create" className="btn btn-primary">Nieuwe set maken</Link>
          <Link href="/create?tab=photo" className="btn">Upload foto</Link>
          <Link href="/create?tab=text" className="btn">Plak tekst</Link>
        </div>
      </section>

      <section className="grid-3">
        <article className="card"><p className="small muted">Sets deze week</p><h2>{stats.setsThisWeek}</h2></article>
        <article className="card"><p className="small muted">Oefentijd</p><h2>{stats.practiceMinutes} min</h2></article>
        <article className="card"><p className="small muted">Behouden percentage</p><h2>{stats.retention}%</h2></article>
      </section>

      <section className="card">
        <h2>Recente projecten</h2>
        {sets.length === 0 ? (
          <p className="muted small">Nog geen sets. Start via Create.</p>
        ) : (
          <div className="grid-3">
            {sets.slice(0, 9).map((set) => (
              <article key={set.id} className="card">
                <h3>{set.title}</h3>
                <p className="small muted">{set.category} · {set.language}</p>
                <p className="small muted">{set.sourceSummary.slice(0, 120)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Suggested for you</h2>
        {suggestions.length === 0 ? (
          <p className="small muted">Nog geen aanbevelingen.</p>
        ) : (
          <ul>
            {suggestions.map((s) => (
              <li key={s.id} className="small" style={{ marginTop: 8 }}>
                Herhaal <b>{s.title}</b> (retentie {s.stats.retentionPercentage}%)
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
